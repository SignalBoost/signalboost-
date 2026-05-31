"use client";

import { FormEvent, useMemo, useState } from "react";
import { buildReviewRequest, complianceChecklist, createSubmission, getReviewsSnapshot } from "@/lib/reviews/engine";
import { normalizeReviewLanguage, reviewCopy } from "@/lib/reviews/localization";
import type { ReviewLanguage, ReviewSubmission } from "@/lib/reviews/types";

const languages: { value: ReviewLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "pl", label: "Polski" },
  { value: "ru", label: "Русский" },
];

const visit = "2026-05-30T10:00:00.000Z";

export default function ReviewsLifecycle() {
  const [language, setLanguage] = useState<ReviewLanguage>("en");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("Excellent service and a friendly team.");
  const [submission, setSubmission] = useState<ReviewSubmission>(() => createSubmission({ customerName: "Demo guest", language: "en", rating: 5, comment: "Excellent service and a friendly team." }));
  const snapshot = useMemo(() => getReviewsSnapshot(language), [language]);
  const localized = reviewCopy[language];
  const request = buildReviewRequest({
    customerName: "Demo guest",
    customerLanguage: language,
    locationId: "us-nyc-02",
    purchaseOrVisitAt: visit,
    consent: {
      emailMarketing: true,
      smsOptIn: true,
      gdprLawfulBasis: "consent",
      country: "US",
      unsubscribeUrl: "https://signalboost.example/unsubscribe/demo",
    },
  });
  const compliance = complianceChecklist(request.consent);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission(createSubmission({ customerName: "Demo guest", language, rating, comment, locationId: "us-nyc-02" }));
  }

  return (
    <div className="reviews-lifecycle">
      <section className="reviews-preview" aria-label="Wireframe preview for the Reviews module">
        <div>
          <p className="cockpit-eyebrow">Wireframe preview</p>
          <h2>Full review lifecycle cockpit</h2>
          <p>
            One module now covers localized collection, branded capture, API sync, monitoring, responses, marketing widgets, analytics, compliance, and Concierge/Outreach handoffs.
          </p>
        </div>
        <div className="reviews-wireframe" aria-hidden="true">
          <span>Request</span><span>Capture</span><span>Sync</span><span>Inbox</span><span>Respond</span><span>Display</span><span>Analyze</span><span>Comply</span>
        </div>
      </section>

      <section className="reviews-grid reviews-collection">
        <article className="reviews-card reviews-card--wide">
          <span className="telemetry-label">1. Collection + reminders</span>
          <h3>Localized request engine</h3>
          <p>{localized.requestSubject}</p>
          <p>{localized.requestBody}</p>
          <div className="reviews-metrics">
            <strong>Optimal send</strong><span>{new Date(request.optimalSendAt).toUTCString()}</span>
            <strong>Reminders</strong><span>{request.reminders.map((item) => new Date(item).toUTCString()).join(" • ")}</span>
            <strong>Channels</strong><span>{request.channels.join(" + ").toUpperCase()}</span>
          </div>
          <div className="reviews-language-row" aria-label="Review request language">
            {languages.map((item) => (
              <button className={language === item.value ? "active" : ""} key={item.value} onClick={() => setLanguage(normalizeReviewLanguage(item.value))} type="button">
                {item.label}
              </button>
            ))}
          </div>
        </article>

        <article className="reviews-card">
          <span className="telemetry-label">Compliance guard</span>
          <h3>CAN-SPAM, GDPR, SMS opt-in</h3>
          <ul className="reviews-checklist">
            <li className={compliance.canSpam ? "ok" : "warn"}>Unsubscribe link + email consent</li>
            <li className={compliance.gdpr ? "ok" : "warn"}>GDPR lawful basis: {request.consent.gdprLawfulBasis}</li>
            <li className={compliance.sms ? "ok" : "warn"}>SMS opt-in recorded</li>
            <li className="ok">Country policy pack: {compliance.country}</li>
          </ul>
        </article>
      </section>

      <section className="reviews-grid">
        <article className="reviews-card reviews-card--wide branded-review-page">
          <span className="telemetry-label">2. Branded landing page</span>
          <h3>{localized.landingTitle}</h3>
          <p>{localized.landingSubtitle}</p>
          <form onSubmit={submitReview} className="review-form">
            <div className="star-row" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button aria-checked={rating === star} className={rating >= star ? "filled" : ""} key={star} onClick={() => setRating(star)} role="radio" type="button">★</button>
              ))}
            </div>
            <textarea aria-label="Written review" onChange={(event) => setComment(event.target.value)} rows={4} value={comment} />
            <div className="upload-row"><span>Photo upload ready</span><span>Video upload ready</span></div>
            <button className="cockpit-primary" type="submit">Submit review</button>
          </form>
          <div className={`route-banner ${submission.sentiment}`}>
            <strong>{submission.sentiment.toUpperCase()} • {submission.rating} stars</strong>
            <span>{submission.routedTo.includes("private") ? localized.negativeRoute : localized.positiveRoute}</span>
          </div>
        </article>

        <article className="reviews-card">
          <span className="telemetry-label">3. Continuous sync</span>
          <h3>Approved connector matrix</h3>
          <div className="connector-list">
            {snapshot.connectors.map((connector) => (
              <div key={connector.platform}>
                <strong>{connector.platform}</strong>
                <span>{connector.status.replace("_", " ")} · {connector.rateLimit}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="reviews-grid">
        <article className="reviews-card reviews-card--wide">
          <span className="telemetry-label">4 + 5. Monitoring and response</span>
          <h3>Unified inbox with AI drafts and assignment</h3>
          <div className="inbox-list">
            {snapshot.inbox.map((item) => (
              <div className="inbox-item" key={item.id}>
                <div><strong>{item.customerName}</strong><span>{item.source} · {item.rating}★ · {item.sentiment}</span></div>
                <p>{item.comment}</p>
                <small>Assigned to {item.assignedTo} · {item.responseStatus.replace("_", " ")}</small>
                <blockquote>{item.aiDraft}</blockquote>
              </div>
            ))}
          </div>
        </article>
        <article className="reviews-card">
          <span className="telemetry-label">6. Display + marketing</span>
          <h3>Widgets, badges, schema, social</h3>
          <div className="review-widget-preview" itemScope itemType="https://schema.org/LocalBusiness">
            <meta itemProp="name" content="SignalBoost Demo Location" />
            <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <strong itemProp="ratingValue">{snapshot.analytics.averageRating}</strong><span>/5 Google-ready stars</span>
              <meta itemProp="reviewCount" content={String(snapshot.analytics.totalReviews)} />
            </div>
            <p>Auto-post queue: 14 great reviews ready for social captions and shareable pages.</p>
          </div>
        </article>
      </section>

      <section className="reviews-grid">
        <article className="reviews-card reviews-card--wide">
          <span className="telemetry-label">7. Analytics + management</span>
          <h3>Multi-location reputation dashboard</h3>
          <div className="analytics-row">
            <div><strong>{snapshot.analytics.averageRating}</strong><span>Average rating</span></div>
            <div><strong>{Math.round(snapshot.analytics.responseRate * 100)}%</strong><span>Response rate</span></div>
            <div><strong>{snapshot.analytics.moderationQueue}</strong><span>Moderation queue</span></div>
            <div><strong>50+</strong><span>Branch-ready permissions</span></div>
          </div>
          <div className="location-table">
            {snapshot.analytics.locations.map((location) => (
              <div key={location.id}><strong>{location.name}</strong><span>{location.city}</span><span>{location.averageRating}★</span><span>{location.openItems} open</span></div>
            ))}
          </div>
        </article>
        <article className="reviews-card">
          <span className="telemetry-label">8. Invisible hard parts</span>
          <h3>Reliability, privacy, billing</h3>
          <ul className="reviews-checklist">
            <li className="ok">Rate-limit backoff and connector cursors</li>
            <li className="ok">Fake-review risk scoring</li>
            <li className="ok">Country-specific data retention packs</li>
            <li className="ok">Subscription gates by location volume</li>
            <li className="ok">24/7 alerting and uptime telemetry</li>
          </ul>
        </article>
      </section>

      <section className="reviews-preview reviews-integration">
        <div>
          <p className="cockpit-eyebrow">Integration</p>
          <h2>Concierge, Admin Console, and Outreach Engine are wired in.</h2>
          <p>
            Concierge answers review queries in the user’s language, Admin telemetry surfaces review volume/sentiment/moderation, and positive reviews can trigger testimonial campaigns.
          </p>
        </div>
        <div className="analytics-row compact">
          <div><strong>18.4K</strong><span>Review volume</span></div>
          <div><strong>89%</strong><span>Positive today</span></div>
          <div><strong>27</strong><span>Moderation</span></div>
        </div>
      </section>
    </div>
  );
}
