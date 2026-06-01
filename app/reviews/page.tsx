// File: app/reviews/page.tsx
// Owner dashboard for the Reviews tool. Logged-in users create businesses,
// copy a shareable /r/{slug} link to collect reviews, and read what comes in.
"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  getMyBusinesses,
  createBusiness,
  getReviewsForBusiness,
  deleteReview,
  averageRating,
  type ReviewBusiness,
  type Review,
} from "@/lib/reviews";

const GOLD = "#f5c542";
const GOLD_DEEP = "#dfa837";

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span style={{ whiteSpace: "nowrap", letterSpacing: 1 }} aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= Math.round(value) ? GOLD : "rgba(255,255,255,.18)", fontSize: size }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function Page() {
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [businesses, setBusinesses] = useState<ReviewBusiness[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const isIn = Boolean(data.user);
      setSignedIn(isIn);
      setAuthChecked(true);
      if (isIn) {
        const list = await getMyBusinesses();
        setBusinesses(list);
        if (list[0]) setActiveId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setReviews([]);
      return;
    }
    let alive = true;
    setLoadingReviews(true);
    getReviewsForBusiness(activeId).then((r) => {
      if (alive) {
        setReviews(r);
        setLoadingReviews(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [activeId]);

  const active = useMemo(() => businesses.find((b) => b.id === activeId) || null, [businesses, activeId]);
  const avg = useMemo(() => averageRating(reviews), [reviews]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    setCreateError(null);
    const res = await createBusiness(name);
    setCreating(false);
    if (res.business) {
      setBusinesses((prev) => [res.business as ReviewBusiness, ...prev]);
      setActiveId(res.business.id);
      setNewName("");
    } else {
      setCreateError(res.error === "not_authenticated" ? "Please log in again." : res.error || "Could not create.");
    }
  }

  function copyLink(slug: string) {
    const url = `${origin}/r/${slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(slug);
      setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1800);
    });
  }

  async function handleDelete(reviewId: string) {
    const res = await deleteReview(reviewId);
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>Trust telemetry</p>
          <h1 style={styles.h1}>Reviews</h1>
          <p style={styles.sub}>Collect customer feedback with a shareable link, and read it all in one place.</p>
        </header>

        {!authChecked ? (
          <p style={styles.muted}>Loading…</p>
        ) : !signedIn ? (
          <div style={styles.card}>
            <h2 style={styles.h2}>Log in to manage reviews</h2>
            <p style={styles.muted}>You need an account to create a business and collect reviews.</p>
            <Link href="/auth/login?next=/reviews" style={styles.primaryBtn}>Log in</Link>
          </div>
        ) : (
          <>
            {/* Create business */}
            <div style={styles.card}>
              <h2 style={styles.h2}>Create a review page</h2>
              <p style={styles.muted}>Give it a business name. You&apos;ll get a link to share with customers.</p>
              <div style={styles.createRow}>
                <input
                  style={styles.input}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Casa Azul Café"
                  maxLength={80}
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  style={{ ...styles.primaryBtn, opacity: !newName.trim() || creating ? 0.5 : 1, whiteSpace: "nowrap" }}
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
              {createError && <p style={styles.error}>{createError}</p>}
            </div>

            {businesses.length === 0 ? (
              <p style={styles.muted}>No review pages yet. Create one above to get started.</p>
            ) : (
              <>
                {/* Business selector */}
                <div style={styles.bizTabs}>
                  {businesses.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveId(b.id)}
                      style={{ ...styles.bizTab, ...(b.id === activeId ? styles.bizTabActive : {}) }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>

                {active && (
                  <>
                    {/* Share link + summary */}
                    <div style={styles.card}>
                      <span style={styles.telemetryLabel}>Shareable link</span>
                      <div style={styles.linkRow}>
                        <code style={styles.linkCode}>{origin}/r/{active.slug}</code>
                        <button type="button" onClick={() => copyLink(active.slug)} style={styles.copyBtn}>
                          {copied === active.slug ? "Copied!" : "Copy"}
                        </button>
                        <a href={`/r/${active.slug}`} target="_blank" rel="noreferrer" style={styles.openBtn}>Open</a>
                      </div>

                      <div style={styles.summaryRow}>
                        <div style={styles.summaryBlock}>
                          <strong style={styles.avgNum}>{avg || "—"}</strong>
                          <Stars value={avg} size={18} />
                        </div>
                        <div style={styles.summaryBlock}>
                          <strong style={styles.avgNum}>{reviews.length}</strong>
                          <span style={styles.muted}>{reviews.length === 1 ? "review" : "reviews"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reviews list */}
                    <div style={styles.card}>
                      <span style={styles.telemetryLabel}>Reviews</span>
                      {loadingReviews ? (
                        <p style={styles.muted}>Loading reviews…</p>
                      ) : reviews.length === 0 ? (
                        <p style={styles.muted}>No reviews yet. Share your link to start collecting.</p>
                      ) : (
                        <div style={styles.reviewList}>
                          {reviews.map((r) => (
                            <div key={r.id} style={styles.reviewItem}>
                              <div style={styles.reviewTop}>
                                <Stars value={r.rating} />
                                <span style={styles.reviewName}>{r.author_name || "Anonymous"}</span>
                                <span style={styles.reviewDate}>
                                  {new Date(r.created_at).toLocaleDateString()}
                                </span>
                                <button type="button" onClick={() => handleDelete(r.id)} style={styles.deleteBtn} aria-label="Delete review">
                                  ✕
                                </button>
                              </div>
                              {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "radial-gradient(60vw 40vh at 20% -5%, rgba(245,197,66,.08), transparent 60%), linear-gradient(180deg,#06060a,#0a0a12)",
    padding: "48px 20px 80px",
    fontFamily: "'Outfit', system-ui, sans-serif",
  },
  shell: { maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 },
  header: { marginBottom: 6 },
  eyebrow: { color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 },
  h1: { color: "#fff", fontSize: 34, fontWeight: 700, margin: "8px 0 6px", letterSpacing: "-0.02em" },
  sub: { color: "#9aa8b8", fontSize: 15, margin: 0, lineHeight: 1.55 },
  card: {
    background: "linear-gradient(180deg, rgba(20,20,28,.8), rgba(10,10,16,.8))",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
  },
  h2: { color: "#fff", fontSize: 19, fontWeight: 700, margin: "0 0 6px" },
  muted: { color: "#9aa8b8", fontSize: 14, margin: 0, lineHeight: 1.55 },
  telemetryLabel: { display: "block", color: GOLD_DEEP, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 },
  createRow: { display: "flex", gap: 10, marginTop: 14 },
  input: {
    flex: 1, boxSizing: "border-box", padding: "11px 13px", borderRadius: 11,
    border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,8,12,.7)", color: "#e6edf3",
    fontSize: 14, fontFamily: "inherit", outline: "none",
  },
  primaryBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "11px 20px", borderRadius: 11, border: "none", color: "#06060a", fontWeight: 800,
    fontSize: 14, textDecoration: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, cursor: "pointer",
  },
  error: { color: "#f8857a", fontSize: 13, margin: "10px 0 0" },
  bizTabs: { display: "flex", flexWrap: "wrap", gap: 8 },
  bizTab: {
    padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.04)", color: "#cbd5e1", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
  },
  bizTabActive: { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: "#06060a", border: "1px solid transparent" },
  linkRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  linkCode: {
    flex: 1, minWidth: 180, padding: "10px 12px", borderRadius: 10, background: "rgba(8,8,12,.7)",
    border: "1px solid rgba(255,255,255,.1)", color: GOLD, fontSize: 13, fontFamily: "monospace", overflowX: "auto",
  },
  copyBtn: {
    padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  openBtn: {
    padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
  },
  summaryRow: { display: "flex", gap: 32, marginTop: 20 },
  summaryBlock: { display: "flex", flexDirection: "column", gap: 4 },
  avgNum: { color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1 },
  reviewList: { display: "flex", flexDirection: "column", gap: 14 },
  reviewItem: { padding: 14, borderRadius: 14, background: "rgba(8,8,12,.5)", border: "1px solid rgba(255,255,255,.06)" },
  reviewTop: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  reviewName: { color: "#e6edf3", fontSize: 13.5, fontWeight: 700 },
  reviewDate: { color: "#6b7685", fontSize: 12, marginLeft: "auto" },
  reviewComment: { color: "#cbd5e1", fontSize: 14, margin: "10px 0 0", lineHeight: 1.5 },
  deleteBtn: {
    background: "none", border: "none", color: "#6b7685", fontSize: 14, cursor: "pointer", padding: "0 4px",
  },
};
