export type ReviewLanguage = "en" | "es" | "pt" | "pl" | "ru";
export type ReviewSentiment = "positive" | "neutral" | "negative";
export type ReviewChannel = "email" | "sms";
export type ReviewPlatform = "google" | "yelp" | "trustpilot" | "facebook" | "tripadvisor" | "appStore" | "industry" | "private";
export type ReviewPermission = "reviews:read" | "reviews:request" | "reviews:respond" | "reviews:moderate" | "reviews:analytics" | "reviews:admin";

export interface ReviewConsent {
  emailMarketing: boolean;
  smsOptIn: boolean;
  gdprLawfulBasis: "consent" | "contract" | "legitimate_interest";
  country: string;
  unsubscribeUrl: string;
}

export interface ReviewRequest {
  id: string;
  customerName: string;
  customerLanguage: ReviewLanguage;
  locationId: string;
  channels: ReviewChannel[];
  purchaseOrVisitAt: string;
  optimalSendAt: string;
  reminders: string[];
  consent: ReviewConsent;
  status: "scheduled" | "sent" | "responded" | "suppressed";
}

export interface ReviewSubmission {
  id: string;
  customerName: string;
  language: ReviewLanguage;
  locationId: string;
  rating: number;
  comment: string;
  media: { type: "photo" | "video"; url: string }[];
  sentiment: ReviewSentiment;
  routedTo: ReviewPlatform[];
  moderationStatus: "approved" | "queued" | "escalated";
  createdAt: string;
}

export interface ReviewSyncConnector {
  platform: ReviewPlatform;
  approval: string;
  rateLimit: string;
  quirks: string[];
  cursor: string;
  status: "healthy" | "approval_needed" | "rate_limited";
  lastSyncedAt: string;
}

export interface ReviewInboxItem extends ReviewSubmission {
  source: ReviewPlatform;
  assignedTo: string;
  responseStatus: "needs_reply" | "drafted" | "published";
  aiDraft: string;
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  moderationQueue: number;
  sentimentTrend: { date: string; positive: number; neutral: number; negative: number; averageRating: number }[];
  locations: { id: string; name: string; city: string; averageRating: number; openItems: number }[];
  competitors: { name: string; averageRating: number; reviewVelocity: string; sentiment: ReviewSentiment }[];
}
