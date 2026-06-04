"use client";

import { useState } from "react";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

const PLAN_PRICE: Record<string, string> = {
  free: "$0",
  starter: "$19/mo",
  growth: "$49/mo",
  enterprise: "Custom",
};

const gold = "#f5c542";
const muted = "#9aa8b8";

export default function SubscriptionsContent({
  email,
  plan,
  status,
  periodEnd,
}: {
  email: string;
  plan: string;
  status: string;
  periodEnd: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasPaidPlan = plan !== "free" && status === "active";
  const planLabel = PLAN_LABELS[plan] || plan;
  const price = PLAN_PRICE[plan] || "";

  const statusColor =
    status === "active" ? "#34d399"
    : status === "past_due" ? "#fbbf24"
    : status === "canceled" ? "#ef4444"
    : muted;

  async function openPortal() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open billing portal.");
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "70vh", background: "#06060a", color: "#e6edf3", fontFamily: "'Outfit', system-ui, sans-serif", padding: "48px 18px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#dfa837", margin: "0 0 10px", textAlign: "center" }}>Billing</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 28px", textAlign: "center" }}>Subscriptions</h1>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Current plan</p>
              <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 800, color: gold }}>{planLabel}</p>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: muted }}>{price}</span>
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 22, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Status</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: statusColor, textTransform: "capitalize" }}>{status}</p>
            </div>
            {periodEnd && (
              <div>
                <p style={{ margin: 0, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Renews</p>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600 }}>{new Date(periodEnd).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Account</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600 }}>{email}</p>
            </div>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

          {hasPaidPlan ? (
            <button
              onClick={openPortal}
              disabled={loading}
              style={{ width: "100%", background: gold, color: "#06060a", border: "none", borderRadius: 10, padding: "12px 0", fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Opening…" : "Manage billing"}
            </button>
          ) : (
            <a href="/pricing" style={{ display: "block", width: "100%", textAlign: "center", background: gold, color: "#06060a", borderRadius: 10, padding: "12px 0", fontFamily: "inherit", fontSize: 15, fontWeight: 800, textDecoration: "none", boxSizing: "border-box" }}>
              View plans
            </a>
          )}
        </div>

        <p style={{ textAlign: "center", color: muted, fontSize: 12, marginTop: 18 }}>
          Manage billing opens a secure Stripe portal where you can update payment or cancel.
        </p>
      </div>
    </main>
  );
}
