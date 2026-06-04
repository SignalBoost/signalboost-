import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminDb() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function planFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  return null;
}

// Defensive: some Stripe API versions surface period end in different places.
function safePeriodEnd(sub: Stripe.Subscription): string | null {
  const anySub = sub as unknown as Record<string, unknown>;
  const top = anySub["current_period_end"];
  const nested = (anySub["items"] as { data?: { current_period_end?: number }[] } | undefined)
    ?.data?.[0]?.current_period_end;
  const raw = (typeof top === "number" ? top : undefined) ?? nested;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return new Date(raw * 1000).toISOString();
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
  const { error } = await db.from("subscriptions").upsert(
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
  if (error) {
    console.error("WEBHOOK_DB_ERROR:", JSON.stringify(error));
    throw new Error("DB upsert failed: " + error.message);
  }
  console.log("WEBHOOK_DB_OK: wrote plan", row.plan, "for", row.owner_id);
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("WEBHOOK_HIT: env present?",
    "secretKey=", !!secretKey,
    "webhookSecret=", !!webhookSecret,
    "serviceRole=", !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    "supabaseUrl=", !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    "priceStarter=", !!process.env.STRIPE_PRICE_STARTER
  );

  if (!secretKey || !webhookSecret) {
    console.error("WEBHOOK_ERROR: missing env vars");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("WEBHOOK_ERROR: no stripe-signature header");
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("WEBHOOK_ERROR: signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature: " + (err as Error).message }, { status: 400 });
  }

  console.log("WEBHOOK_EVENT:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ownerId = session.client_reference_id || session.metadata?.supabase_user_id;
        console.log("WEBHOOK_CHECKOUT: ownerId=", ownerId, "sub=", session.subscription);
        if (!ownerId) {
          console.error("WEBHOOK_ERROR: no ownerId on session");
          break;
        }
        const subId = (session.subscription as string) || null;
        let plan = session.metadata?.plan || null;
        let periodEnd: string | null = null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price?.id;
          plan = planFromPriceId(priceId) || plan;
          periodEnd = safePeriodEnd(sub);
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
        if (!ownerId) { console.error("WEBHOOK_ERROR: no ownerId on sub.updated"); break; }
        const priceId = sub.items.data[0]?.price?.id;
        const plan = planFromPriceId(priceId) || "starter";
        const status = sub.status === "active" || sub.status === "trialing" ? "active"
          : sub.status === "past_due" ? "past_due"
          : sub.status === "canceled" ? "canceled" : "inactive";
        await upsertSubscription({
          owner_id: ownerId, plan, status,
          stripe_customer_id: (sub.customer as string) || null,
          stripe_subscription_id: sub.id,
          current_period_end: safePeriodEnd(sub),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const ownerId = sub.metadata?.supabase_user_id;
        if (!ownerId) { console.error("WEBHOOK_ERROR: no ownerId on sub.deleted"); break; }
        await upsertSubscription({
          owner_id: ownerId, plan: "free", status: "canceled",
          stripe_customer_id: (sub.customer as string) || null,
          stripe_subscription_id: sub.id,
          current_period_end: null,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("WEBHOOK_HANDLER_ERROR:", (err as Error).message);
    return NextResponse.json({ error: "Handler error: " + (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
