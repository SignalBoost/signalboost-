import { reviewCopy, normalizeReviewLanguage } from "@/lib/reviews/localization";
import type { ReviewAnalytics, ReviewConsent, ReviewInboxItem, ReviewLanguage, ReviewPlatform, ReviewRequest, ReviewSentiment, ReviewSubmission, ReviewSyncConnector } from "@/lib/reviews/types";

const positiveWords = ["great", "excellent", "love", "amazing", "helpful", "fast", "friendly", "perfect", "bueno", "excelente", "ótimo", "bom", "super", "świet", "хорош", "отлич"];
const negativeWords = ["bad", "terrible", "slow", "rude", "broken", "angry", "refund", "malo", "lento", "ruim", "zły", "ужас", "плох"];

export const reviewConnectors: ReviewSyncConnector[] = [
  { platform: "google", approval: "Google Business Profile API OAuth approval + location verification required", rateLimit: "Backoff on 429 and batch by account/location", quirks: ["Replies require verified business ownership", "Review edits arrive as updates, not new events"], cursor: "gmb-2026-05-31T08:00:00Z", status: "healthy", lastSyncedAt: "2026-05-31T08:00:00Z" },
  { platform: "yelp", approval: "Yelp Fusion/API access review before production write workflows", rateLimit: "Daily quotas with conservative polling windows", quirks: ["Some response actions require Yelp for Business auth", "Limited historical payload fields"], cursor: "yelp-2026-05-31T07:45:00Z", status: "approval_needed", lastSyncedAt: "2026-05-31T07:45:00Z" },
  { platform: "trustpilot", approval: "Trustpilot business unit invitation + private API credentials", rateLimit: "Cursor sync with retry-after support", quirks: ["Invitation service is separate from review ingestion"], cursor: "tp-2026-05-31T07:30:00Z", status: "healthy", lastSyncedAt: "2026-05-31T07:30:00Z" },
  { platform: "facebook", approval: "Meta app review for Page ratings and messaging permissions", rateLimit: "Graph API app/page quotas", quirks: ["Page access tokens expire if not refreshed", "Recommendations differ from classic star reviews"], cursor: "fb-2026-05-31T07:15:00Z", status: "healthy", lastSyncedAt: "2026-05-31T07:15:00Z" },
  { platform: "tripadvisor", approval: "Tripadvisor Content API partner approval", rateLimit: "Partner-specific quota windows", quirks: ["Property mapping must be manually verified"], cursor: "ta-2026-05-31T07:00:00Z", status: "rate_limited", lastSyncedAt: "2026-05-31T07:00:00Z" },
  { platform: "appStore", approval: "App Store Connect and Google Play Console service accounts", rateLimit: "Store-specific pagination and quota handling", quirks: ["Country storefront changes affect review language", "Reply publishing can be delayed"], cursor: "store-2026-05-31T06:45:00Z", status: "healthy", lastSyncedAt: "2026-05-31T06:45:00Z" },
  { platform: "industry", approval: "Configurable industry directory credentials and scraping policy review", rateLimit: "Robots.txt-aware crawl and API throttles", quirks: ["Schema varies by vertical", "Human approval for new directories"], cursor: "industry-2026-05-31T06:30:00Z", status: "healthy", lastSyncedAt: "2026-05-31T06:30:00Z" },
];

export const sampleInbox: ReviewInboxItem[] = [
  { id: "rev-1042", customerName: "María G.", language: "es", locationId: "mx-cdmx-01", rating: 5, comment: "Excelente servicio, rápido y muy amable.", media: [{ type: "photo", url: "/reviews/counter.jpg" }], sentiment: "positive", routedTo: ["google", "facebook"], moderationStatus: "approved", createdAt: "2026-05-31T08:14:00Z", source: "google", assignedTo: "Growth desk", responseStatus: "drafted", aiDraft: "¡Gracias, María! Nos alegra saber que el equipo te atendió rápido y con amabilidad." },
  { id: "rev-1041", customerName: "Jordan P.", language: "en", locationId: "us-nyc-02", rating: 2, comment: "Pickup was slow and the order was missing an item.", media: [], sentiment: "negative", routedTo: ["private"], moderationStatus: "escalated", createdAt: "2026-05-31T07:52:00Z", source: "private", assignedTo: "NYC manager", responseStatus: "needs_reply", aiDraft: "Jordan, I’m sorry the pickup missed our standard. We’re checking the order now and will contact you directly with a fix." },
  { id: "rev-1040", customerName: "Ana C.", language: "pt", locationId: "br-sp-03", rating: 4, comment: "Bom atendimento e ambiente limpo.", media: [], sentiment: "positive", routedTo: ["trustpilot", "tripadvisor"], moderationStatus: "approved", createdAt: "2026-05-30T22:10:00Z", source: "trustpilot", assignedTo: "LATAM desk", responseStatus: "published", aiDraft: "Obrigado, Ana! Ficamos felizes com seu comentário sobre o atendimento e o ambiente." },
];

export const reviewAnalytics: ReviewAnalytics = {
  averageRating: 4.72,
  totalReviews: 18432,
  responseRate: 0.91,
  moderationQueue: 27,
  sentimentTrend: [
    { date: "2026-05-25", positive: 82, neutral: 11, negative: 7, averageRating: 4.62 },
    { date: "2026-05-26", positive: 85, neutral: 9, negative: 6, averageRating: 4.68 },
    { date: "2026-05-27", positive: 80, neutral: 12, negative: 8, averageRating: 4.6 },
    { date: "2026-05-28", positive: 88, neutral: 8, negative: 4, averageRating: 4.78 },
    { date: "2026-05-29", positive: 90, neutral: 6, negative: 4, averageRating: 4.82 },
    { date: "2026-05-30", positive: 86, neutral: 8, negative: 6, averageRating: 4.73 },
    { date: "2026-05-31", positive: 89, neutral: 7, negative: 4, averageRating: 4.79 },
  ],
  locations: [
    { id: "us-nyc-02", name: "New York Midtown", city: "New York", averageRating: 4.6, openItems: 8 },
    { id: "mx-cdmx-01", name: "CDMX Roma", city: "Ciudad de México", averageRating: 4.9, openItems: 3 },
    { id: "br-sp-03", name: "São Paulo Jardins", city: "São Paulo", averageRating: 4.8, openItems: 5 },
    { id: "pl-waw-01", name: "Warsaw Central", city: "Warszawa", averageRating: 4.7, openItems: 4 },
  ],
  competitors: [
    { name: "Metro Local Co.", averageRating: 4.31, reviewVelocity: "+4% MoM", sentiment: "neutral" },
    { name: "Northstar Service", averageRating: 4.44, reviewVelocity: "+9% MoM", sentiment: "positive" },
    { name: "Budget Express", averageRating: 3.92, reviewVelocity: "-2% MoM", sentiment: "negative" },
  ],
};

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function analyzeReviewSentiment(rating: number, comment: string): ReviewSentiment {
  const text = comment.toLowerCase();
  const positiveScore = positiveWords.filter((word) => text.includes(word)).length;
  const negativeScore = negativeWords.filter((word) => text.includes(word)).length;
  if (rating >= 4 && positiveScore >= negativeScore) return "positive";
  if (rating <= 2 || negativeScore > positiveScore + 1) return "negative";
  return "neutral";
}

export function detectFakeReviewRisk(input: { rating: number; comment: string; mediaCount?: number }) {
  const repeated = /(.)\1{5,}/.test(input.comment);
  const tooShort = input.comment.trim().split(/\s+/).length < 3;
  const extremeNoDetail = (input.rating === 1 || input.rating === 5) && tooShort && !input.mediaCount;
  const risk = repeated || extremeNoDetail ? "high" : tooShort ? "medium" : "low";
  return { risk, signals: [repeated && "repeated characters", tooShort && "thin text", extremeNoDetail && "extreme rating without detail"].filter(Boolean) as string[] };
}

export function routeReview(rating: number, sentiment: ReviewSentiment): ReviewPlatform[] {
  if (rating >= 4 && sentiment === "positive") return ["google", "facebook", "trustpilot"];
  if (rating <= 3 || sentiment === "negative") return ["private"];
  return ["private", "trustpilot"];
}

export function buildReviewRequest(input: { customerName: string; customerLanguage?: string; locationId: string; purchaseOrVisitAt: string; consent: ReviewConsent }): ReviewRequest {
  const lang = normalizeReviewLanguage(input.customerLanguage);
  const visit = new Date(input.purchaseOrVisitAt);
  const channels = [input.consent.emailMarketing && "email", input.consent.smsOptIn && "sms"].filter(Boolean) as ("email" | "sms")[];
  return {
    id: `req-${input.locationId}-${visit.getTime()}`,
    customerName: input.customerName,
    customerLanguage: lang,
    locationId: input.locationId,
    channels,
    purchaseOrVisitAt: visit.toISOString(),
    optimalSendAt: addHours(visit, 24),
    reminders: [addHours(visit, 72), addHours(visit, 168)],
    consent: input.consent,
    status: channels.length ? "scheduled" : "suppressed",
  };
}

export function complianceChecklist(consent: ReviewConsent) {
  return {
    canSpam: consent.emailMarketing && Boolean(consent.unsubscribeUrl),
    gdpr: consent.gdprLawfulBasis === "consent" || consent.gdprLawfulBasis === "contract" || consent.gdprLawfulBasis === "legitimate_interest",
    sms: consent.smsOptIn,
    country: consent.country,
  };
}

export function createSubmission(input: { customerName?: string; language?: string; locationId?: string; rating?: number; comment?: string; media?: ReviewSubmission["media"] }): ReviewSubmission {
  const rating = Math.max(1, Math.min(5, Number(input.rating || 5)));
  const comment = String(input.comment || "").slice(0, 2000);
  const sentiment = analyzeReviewSentiment(rating, comment);
  const fakeRisk = detectFakeReviewRisk({ rating, comment, mediaCount: input.media?.length || 0 });
  return {
    id: `rev-${Date.now()}`,
    customerName: input.customerName || "Guest",
    language: normalizeReviewLanguage(input.language),
    locationId: input.locationId || "default-location",
    rating,
    comment,
    media: input.media || [],
    sentiment,
    routedTo: routeReview(rating, sentiment),
    moderationStatus: fakeRisk.risk === "high" || sentiment === "negative" ? "escalated" : fakeRisk.risk === "medium" ? "queued" : "approved",
    createdAt: new Date().toISOString(),
  };
}

export function getReviewsSnapshot(lang: ReviewLanguage = "en") {
  return { copy: reviewCopy[lang], analytics: reviewAnalytics, connectors: reviewConnectors, inbox: sampleInbox };
}
