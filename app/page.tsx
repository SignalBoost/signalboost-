// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer";
import initialPartnersList from "@/public/partners.json";

export default function HomePage() {
  return (
    <div style={{
      backgroundColor: "#060913",
      minHeight: "screen",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: "6rem",
      paddingBottom: "3rem",
      position: "relative",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      
      {/* Visual Background Lighting Accent */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "1000px",
        height: "400px",
        background: "linear-gradient(to bottom, rgba(245, 158, 11, 0.06), transparent)",
        borderRadius: "50%",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Main Content Area */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: "48rem",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        zIndex: 10,
        width: "100%"
      }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "#f59e0b", marginBottom: "0.5rem" }}>
          SignalBoost
        </h1>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "1.5rem" }}>
          Your AI-Guided Digital Shopping Mall
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "1.125rem", lineHeight: "1.75rem", marginBottom: "2rem" }}>
          Tell me what you need and I’ll guide you to the right trusted partner — flights, hotels, eSIMs, cars and more, matched perfectly to your country.
        </p>

        {/* Beautiful Functional Search Container Block */}
        <div style={{
          width: "100%",
          maxWidth: "36rem",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "1rem",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          marginBottom: "1.5rem",
          backdropFilter: "blur(12px)"
        }}>
          <input 
            type="text" 
            placeholder='Try typing: "flights to Lima next month"' 
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              paddingLeft: "1rem",
              fontSize: "0.875rem",
              color: "#e5e7eb"
            }}
            disabled
          />
          <button style={{
            height: "2.5rem",
            width: "2.5rem",
            backgroundColor: "#f59e0b",
            border: "none",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#000000",
            cursor: "pointer"
          }}>
            →
          </button>
        </div>

        {/* Premium Category Badges Selection */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", maxWidth: "36rem" }}>
          {["✈️ Flights", "🏨 Hotels", "📶 eSIM & Internet", "🎟️ Tours & Activities", "🚗 Car Rentals", "🛒 Marketplace"].map((pill) => (
            <span key={pill} style={{
              padding: "0.5rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              fontSize: "0.75rem",
              color: "#d1d5db"
            }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Scroller Loops Layer */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <div style={{ width: "100%", zIndex: 10, marginTop: "2rem", marginBottom: "2rem" }}>
          <PartnerMarquee partnersData={initialPartnersList} />
        </div>
      )}

      {/* Trust Context Notice */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", zIndex: 10, marginBottom: "1rem" }}>
        Directly connecting you with Booking.com, Aviasales, Amazon and 120+ vetted global networks.
      </div>

      <Footer />
      
    </div>
  );
}
