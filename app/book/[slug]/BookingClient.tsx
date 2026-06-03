import { getServiceBySlug, getAvailableDaysOfWeek } from "@/lib/calendar";
import BookingClient from "./BookingClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Booking - SignalBoost" };
  return { title: "Book " + service.name + " - SignalBoost" };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let service = null;
  let errorMsg = "";

  try {
    service = await getServiceBySlug(slug);
  } catch (err) {
    errorMsg = "Exception: " + String(err);
  }

  if (!service) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", background: "#111", color: "#fff", minHeight: "100vh" }}>
        <h2 style={{ color: "#f5c542" }}>Debug: Booking page reached</h2>
        <p>Slug received: <strong>{slug}</strong></p>
        <p>Service found: <strong style={{ color: "#ef4444" }}>NO</strong></p>
        {errorMsg && <p>Error: <strong style={{ color: "#ef4444" }}>{errorMsg}</strong></p>}
        <p style={{ color: "#888", marginTop: 24 }}>The route is working. The issue is getServiceBySlug returning null.</p>
      </div>
    );
  }

  const availableDays = await getAvailableDaysOfWeek(service.id);
  return <BookingClient service={service} availableDays={availableDays} />;
}
