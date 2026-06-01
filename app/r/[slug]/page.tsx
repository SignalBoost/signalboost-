// File: app/r/[slug]/page.tsx
// Public review collection page. No login required. Customers open this from
// the shareable link and leave a star rating + optional name + comment.
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { getBusinessBySlug, submitReview, type ReviewBusiness } from "@/lib/reviews";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [business, setBusiness] = useState<ReviewBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    getBusinessBySlug(slug).then((b) => {
      if (alive) {
        setBusiness(b);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  async function handleSubmit() {
    if (!business || rating === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await submitReview({ businessId: business.id, rating, authorName: name, comment });
    setSubmitting(false);
    if (res.ok) setDone(true);
    else setError("Something went wrong. Please try again.");
  }

  return (
    <main style={styles.page}>
      <div style={styles.glow} aria-hidden="true" />
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandMark}>S</span>
          <span style={styles.brandText}>
            signal<strong style={{ color: GOLD }}>boost</strong>
          </span>
        </div>

        {loading ? (
          <p style={styles.muted}>Loading…</p>
        ) : !business ? (
          <div>
            <h1 style={styles.title}>Link not found</h1>
            <p style={styles.muted}>This review link is invalid or has been removed.</p>
          </div>
        ) : done ? (
          <div style={{ textAlign: "center" }}>
            <div style={styles.bigStar}>★</div>
            <h1 style={styles.title}>Thank you!</h1>
            <p style={styles.muted}>Your review for {business.name} has been submitted.</p>
          </div>
        ) : (
          <div>
            <p style={styles.eyebrow}>Leave a review</p>
            <h1 style={styles.title}>{business.name}</h1>
            <p style={styles.muted}>How was your experience? Your feedback helps a lot.</p>

            <div style={styles.starRow} role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    ...styles.star,
                    color: (hover || rating) >= n ? GOLD : "rgba(255,255,255,.18)",
                    transform: (hover || rating) >= n ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <label style={styles.label}>Your name (optional)</label>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane D."
              maxLength={80}
            />

            <label style={styles.label}>Comment (optional)</label>
            <textarea
              style={{ ...styles.input, minHeight: 96, resize: "vertical" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell them what you liked…"
              maxLength={1000}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              style={{
                ...styles.submit,
                opacity: rating === 0 || submitting ? 0.5 : 1,
                cursor: rating === 0 || submitting ? "default" : "pointer",
              }}
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "radial-gradient(70vw 50vh at 50% -10%, rgba(245,197,66,.10), transparent 60%), linear-gradient(180deg,#06060a,#0a0a12)",
    position: "relative",
    fontFamily: "'Outfit', system-ui, sans-serif",
  },
  glow: { position: "fixed", inset: 0, pointerEvents: "none" },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "linear-gradient(180deg, rgba(20,20,28,.86), rgba(10,10,16,.86))",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 24,
    padding: "34px 30px",
    boxShadow: "0 30px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)",
    backdropFilter: "blur(14px)",
    position: "relative",
  },
  brand: { display: "flex", alignItems: "center", gap: 9, marginBottom: 22 },
  brandMark: {
    width: 30, height: 30, borderRadius: 8,
    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
    display: "grid", placeItems: "center", color: "#06060a", fontWeight: 900,
  },
  brandText: { color: "#fff", fontWeight: 800, fontSize: 17 },
  eyebrow: { color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 },
  title: { color: "#fff", fontSize: 26, fontWeight: 700, margin: "8px 0 6px", letterSpacing: "-0.02em" },
  muted: { color: "#9aa8b8", fontSize: 14.5, margin: "0 0 18px", lineHeight: 1.55 },
  starRow: { display: "flex", gap: 6, margin: "10px 0 22px" },
  star: { background: "none", border: "none", fontSize: 40, lineHeight: 1, padding: 0, transition: "transform .12s ease, color .12s ease" },
  bigStar: { color: GOLD, fontSize: 64, lineHeight: 1, marginBottom: 8 },
  label: { display: "block", color: "#9aa8b8", fontSize: 12.5, fontWeight: 600, margin: "12px 0 6px" },
  input: {
    width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11,
    border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: "#e6edf3",
    fontSize: 14, fontFamily: "inherit", outline: "none",
  },
  error: { color: "#f8857a", fontSize: 13, margin: "12px 0 0" },
  submit: {
    width: "100%", marginTop: 20, padding: "13px 16px", borderRadius: 12, border: "none",
    color: "#06060a", fontWeight: 800, fontSize: 15,
    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
  },
};
