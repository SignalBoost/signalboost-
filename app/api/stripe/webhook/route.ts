import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// The webhook must read the raw body to verify Stripe's signature, so we opt
// out of any body parsing/caching.
export const dynamic = "force-dynamic";

// Service-role client: bypasses RLS so the webhook can write subscription rows.
// This key is server-only and must NEVER be exposed to the browser.
function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Map a Stripe price ID back to our plan key.
function planFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  return null;
}

async function upsertSubscription(row: {
  owner_id: string;
  plan: string;
  status: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
}) {
  const db = adminDb();
  const { error } = await db
    .from("subscriptions")
    .upsert(
      {
        owner_id: row.owner_id,
        plan: row.plan,
        status: row.status,
        stripe_customer_id: row.stripe_customer_id ?? null,
        stripe_subscription_id: row.stripe_subscription_id ?? null,
        current_period_end: row.current_period_end ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id" }
    );
  if (error) throw error;
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ownerId = session.client_reference_id || session.metadata?.supabase_user_id;
        if (!ownerId) break;

        // Pull the subscription to get the price → plan and period end.
        const subId = session.subscription as string | null;
        let plan = session.metadata?.plan || null;
        let periodEnd: string | null = null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price?.id;
          plan = planFromPriceId(priceId) || plan;
          if (sub.current_period_end) {
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
        }
        await upsertSubscription({
          owner_id: ownerId,
          plan: plan || "starter",
          status: "active",
          stripe_customer_id: (session.customer as string) || null,
          stripe_subscription_id: subId,
          current_period_end: periodEnd,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const ownerId = sub.metadata?.supabase_user_id;
        if (!ownerId) break;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = planFromPriceId(priceId) || "starter";
        const status = sub.status === "active" || sub.status === "trialing" ? "active"
          : sub.status === "past_due" ? "past_due"
          : sub.status === "canceled" ? "canceled" : "inactive";
        await upsertSubscription({
          owner_id: ownerId,
          plan,
          status,
          stripe_customer_id: (sub.customer as string) || null,
          stripe_subscription_id: sub.id,
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const ownerId = sub.metadata?.supabase_user_id;
        if (!ownerId) break;
        await upsertSubscription({
          owner_id: ownerId,
          plan: "free",
          status: "canceled",
          stripe_customer_id: (sub.customer as string) || null,
          stripe_subscription_id: sub.id,
          current_period_end: null,
        });
        break;
      }

      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 500 so Stripe retries — better than silently losing an event.
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
