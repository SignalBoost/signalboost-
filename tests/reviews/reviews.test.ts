import { analyzeReviewSentiment, buildReviewRequest, complianceChecklist, createSubmission, routeReview } from "@/lib/reviews/engine";

describe("Reviews lifecycle engine", () => {
  it("submits localized reviews in multiple languages", () => {
    const spanish = createSubmission({ customerName: "Ana", language: "es", rating: 5, comment: "Excelente servicio rápido" });
    const portuguese = createSubmission({ customerName: "João", language: "pt", rating: 4, comment: "Bom atendimento" });

    expect(spanish.language).toBe("es");
    expect(portuguese.language).toBe("pt");
    expect(spanish.routedTo).toContain("google");
  });

  it("classifies positive, neutral, and negative sentiment", () => {
    expect(analyzeReviewSentiment(5, "Great and helpful team")).toBe("positive");
    expect(analyzeReviewSentiment(3, "It was okay overall")).toBe("neutral");
    expect(analyzeReviewSentiment(1, "Terrible slow pickup and rude desk")).toBe("negative");
  });

  it("routes negative reviews to private moderation", () => {
    const submission = createSubmission({ rating: 2, comment: "Bad slow service" });

    expect(submission.routedTo).toEqual(["private"]);
    expect(submission.moderationStatus).toBe("escalated");
  });

  it("schedules compliant requests and reminders after visits", () => {
    const request = buildReviewRequest({
      customerName: "Jordan",
      customerLanguage: "en",
      locationId: "us-nyc-02",
      purchaseOrVisitAt: "2026-05-30T10:00:00.000Z",
      consent: {
        emailMarketing: true,
        smsOptIn: true,
        gdprLawfulBasis: "consent",
        country: "US",
        unsubscribeUrl: "https://signalboost.example/unsubscribe/jordan",
      },
    });

    expect(request.optimalSendAt).toBe("2026-05-31T10:00:00.000Z");
    expect(request.reminders).toHaveLength(2);
    expect(complianceChecklist(request.consent)).toMatchObject({ canSpam: true, gdpr: true, sms: true });
  });

  it("validates public and private routing decisions", () => {
    expect(routeReview(5, "positive")).toContain("trustpilot");
    expect(routeReview(1, "negative")).toEqual(["private"]);
  });
});
