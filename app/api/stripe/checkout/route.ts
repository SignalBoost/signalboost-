import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// Maps our plan keys to the Stripe Price IDs (set in Vercel env vars).
// Enterprise is intentionally absent — it's contact-sales, not self-serve.
const PRICE_BY_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
};

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"];

type ExistingSubscription = {
  plan: string | null;
  status: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
    }

    // Must be logged in to subscribe — we tie the Stripe customer to this user.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to subscribe." }, { status: 401 });
    }

    const { plan } = await req.json();
    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Unknown or non-self-serve plan." }, { status: 400 });
    }

    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan,status")
      .eq("owner_id", user.id)
      .maybeSingle<ExistingSubscription>();

    if (subscriptionError) {
      console.error("POST /api/stripe/checkout: subscription lookup failed", subscriptionError);
      return NextResponse.json({ error: "Could not verify current subscription." }, { status: 500 });
    }

    const existingStatus = existingSubscription?.status ?? "";
    if (
      existingSubscription?.plan === plan &&
      ACTIVE_SUBSCRIPTION_STATUSES.includes(existingStatus)
    ) {
      return NextResponse.json({ url: "/subscriptions?status=already_active" });
    }

    const stripe = new Stripe(secretKey);

    // Where Stripe sends the user after paying / cancelling.
    const origin = req.headers.get("origin") || "https://signalboostapp.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Tie the checkout to our user so the webhook can map payment → account.
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
      },
      success_url: `${origin}/subscriptions?status=success`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/stripe/checkout:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}