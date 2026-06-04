"use client";

import React, { useState } from "react";

type PlanKey = "starter" | "growth";

export default function BillingTestPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: PlanKey) {
    setLoadingPlan(plan);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Checkout did not return a Stripe URL.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not start checkout.");
      setLoadingPlan(null);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Internal billing test</p>
        <h1 style={titleStyle}>Operations Stripe checkout test</h1>
        <p style={copyStyle}>
          This hidden page verifies Stripe before the public pricing page is unlocked.
          You must be signed in because the checkout route ties the subscription to your account.
        </p>

        <button
          type="button"
          onClick={() => startCheckout("starter")}
          disabled={Boolean(loadingPlan)}
          style={buttonStyle}
        >
          {loadingPlan === "starter" ? "Opening Stripe…" : "Test Starter Checkout — $19/mo"}
        </button>

        <button
          type="button"
          onClick={() => startCheckout("growth")}
          disabled={Boolean(loadingPlan)}
          style={buttonStyle}
        >
          {loadingPlan === "growth" ? "Opening Stripe…" : "Test Growth Checkout — $49/mo"}
        </button>

        {error && <p style={errorStyle}>{error}</p>}

        <p style={warningStyle}>
          After a successful test, confirm the Stripe webhook delivery and the Supabase subscriptions row,
          then refund the test payment in Stripe.
        </p>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "#07080c",
  color: "#f6f0dc",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
  border: "1px solid rgba(245,197,66,.22)",
  borderRadius: 18,
  padding: 28,
  background: "rgba(13,15,24,.92)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#dfa837",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".16em",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "8px 0 12px",
  fontSize: 30,
  lineHeight: 1.1,
};

const copyStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(246,240,220,.78)",
  lineHeight: 1.6,
};

const buttonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 16,
  padding: "16px 18px",
  borderRadius: 14,
  border: "1px solid rgba(245,197,66,.36)",
  background: "rgba(245,197,66,.09)",
  color: "#f6f0dc",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  marginTop: 18,
  color: "#ffb4a8",
  fontWeight: 700,
};

const warningStyle: React.CSSProperties = {
  margin: "24px 0 0",
  color: "rgba(246,240,220,.58)",
  fontSize: 13,
  lineHeight: 1.5,
};
