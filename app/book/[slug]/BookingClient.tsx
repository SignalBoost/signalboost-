import { notFound } from "next/navigation";
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
  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  const availableDays = await getAvailableDaysOfWeek(service.id);
  return <BookingClient service={service} availableDays={availableDays} />;
}
