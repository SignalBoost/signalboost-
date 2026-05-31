import SaasModulePage from "@/components/SaasModulePage";
import ReviewsLifecycle from "@/components/reviews/ReviewsLifecycle";

export const metadata = {
  title: "SignalBoost — Reviews",
  description: "Complete reviews lifecycle system for collection, capture, sync, monitoring, response, display, analytics, and compliance.",
};

export default function Page() {
  return (
    <>
      <SaasModulePage slug="reviews" />
      <ReviewsLifecycle />
    </>
  );
}
