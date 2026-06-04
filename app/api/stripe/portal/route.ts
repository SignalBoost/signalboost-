import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// Opens the Stripe Customer Portal so a user can manage or cancel their plan.
export async function POST() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    // Find this user's Stripe customer id from their subscription row.
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("owner_id", user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
    }

    const stripe = new Stripe(secretKey);
    const origin = "https://www.signalboostapp.com";

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/subscriptions`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/stripe/portal:", err);
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 500 });
  }
}
