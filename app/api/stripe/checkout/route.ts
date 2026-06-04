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

async function hasActiveStripeSubscriptionForPrice(stripe: Stripe, email: string | null | undefined, priceId: string) {
  if (!email) return false;

  const customers = await stripe.customers.list({ email, limit: 10 });

  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 100,
    });

    const hasMatchingSubscription = subscriptions.data.some((subscription) => {
      if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) return false;
      return subscription.items.data.some((item) => item.price.id === priceId);
    });

    if (hasMatchingSubscription) return true;
  }

  return false;
}

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

    const stripe = new Stripe(secretKey);

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
    const alreadyHasPlanInSupabase =
      existingSubscription?.plan === plan && ACTIVE_SUBSCRIPTION_STATUSES.includes(existingStatus);
    const alreadyHasPlanInStripe = await hasActiveStripeSubscriptionForPrice(stripe, user.email, priceId);

    if (alreadyHasPlanInSupabase || alreadyHasPlanInStripe) {
      return NextResponse.json({ url: "/subscriptions?status=already_active" });
    }

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