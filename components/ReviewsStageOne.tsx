"use client";

import { FormEvent, useState } from "react";
import useTranslation from "@/components/i18n/useTranslation";

function fallbackText(value: string, fallback: string) {
  return value.includes(".") ? fallback : value;
}

export default function ReviewsStageOne() {
  const { t, lang } = useTranslation();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/reviews/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, locale: lang }),
      });
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="cockpit-section reviews-stage-one" aria-labelledby="reviews-stage-one-title">
      <div className="reviews-stage-one__intro">
        <p className="cockpit-eyebrow">{fallbackText(t("reviewsStage1.eyebrow"), "Reviews Stage 1")}</p>
        <h2 id="reviews-stage-one-title">{fallbackText(t("reviewsStage1.title"), "Collect customer reviews by email or SMS")}</h2>
        <p>{fallbackText(t("reviewsStage1.description"), "Send a localized request, store the customer in Supabase, and keep the queue ready for Google review display and response monitoring stages.")}</p>
        <div className="reviews-stage-one__queue-card">
          <strong>{fallbackText(t("reviewsStage1.inboxTitle"), "Stage 1 collection queue")}</strong>
          <span>{fallbackText(t("reviewsStage1.inboxDescription"), "Each submission creates a Supabase review_requests row with locale, channel, and delivery status metadata.")}</span>
        </div>
      </div>

      <form className="reviews-stage-one__form" onSubmit={handleSubmit}>
        <label>
          {fallbackText(t("reviewsStage1.businessLabel"), "Business name")}
          <input name="businessName" required placeholder="SignalBoost" />
        </label>
        <label>
          {fallbackText(t("reviewsStage1.customerLabel"), "Customer name")}
          <input name="customerName" required placeholder="Alex Customer" />
        </label>
        <div className="reviews-stage-one__two-col">
          <label>
            {fallbackText(t("reviewsStage1.emailLabel"), "Customer email")}
            <input name="customerEmail" type="email" placeholder="alex@example.com" />
          </label>
          <label>
            {fallbackText(t("reviewsStage1.phoneLabel"), "Customer phone")}
            <input name="customerPhone" type="tel" placeholder="+1 555 0100" />
          </label>
        </div>
        <div className="reviews-stage-one__two-col">
          <label>
            {fallbackText(t("reviewsStage1.channelLabel"), "Delivery channel")}
            <select name="channel" defaultValue="email">
              <option value="email">{fallbackText(t("reviewsStage1.channelEmail"), "Email")}</option>
              <option value="sms">{fallbackText(t("reviewsStage1.channelSms"), "SMS")}</option>
              <option value="both">{fallbackText(t("reviewsStage1.channelBoth"), "Email + SMS")}</option>
            </select>
          </label>
          <label>
            {fallbackText(t("reviewsStage1.ratingLabel"), "Private rating")}
            <select name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{"★".repeat(rating)}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          {fallbackText(t("reviewsStage1.messageLabel"), "Review request note")}
          <textarea name="message" rows={4} placeholder={fallbackText(t("reviewsStage1.messagePlaceholder"), "Thanks for visiting us — could you share your experience?")} />
        </label>
        <p className="reviews-stage-one__disclaimer">{fallbackText(t("reviewsStage1.disclaimer"), "SMS delivery is queued in Supabase for provider activation; email sends immediately when RESEND_API_KEY is configured.")}</p>
        <button className="cockpit-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? fallbackText(t("reviewsStage1.sending"), "Sending request…") : fallbackText(t("reviewsStage1.submit"), "Send review request")}
        </button>
        {status === "success" && <p className="reviews-stage-one__success">{fallbackText(t("reviewsStage1.success"), "Review request queued and stored.")}</p>}
        {status === "error" && <p className="reviews-stage-one__error">{fallbackText(t("reviewsStage1.error"), "Could not queue the review request. Please try again.")}</p>}
      </form>
    </section>
  );
}
