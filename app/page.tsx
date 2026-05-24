// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer";
import initialPartnersList from "@/public/partners.json";

// Explicitly import your home style sheets for the marquee keyframe loops
import "./home.css"; 

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center px-4" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* Main Content Hero Block */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: "42rem",
        width: "100%",
        paddingTop: "4rem",
        paddingBottom: "2rem",
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: "3.5rem", 
          fontWeight: 800, 
          letterSpacing: "-0.03em",
          color: "#f59e0b", 
          marginBottom: "0.5rem"
        }}>
          SignalBoost
        </h1>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#f3f4f6", marginBottom: "1.5rem" }}>
          Your AI-Guided Digital Shopping Mall
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: "1.6rem", marginBottom: "2.5rem" }}>
          Tell me what you need and I’ll guide you to the right trusted partner — flights, hotels, eSIMs, cars and more, matched perfectly to your country.
        </p>

        {/* Custom Search bar Container */}
        <div style={{
          width: "100%",
          maxWidth: "32rem",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "1.25rem",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)"
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
              fontSize: "0.95rem",
              color: "#ffffff"
            }}
            disabled
          />
          <button style={{
            height: "2.5rem",
            width: "2.5rem",
            backgroundColor: "#f59e0b",
            border: "none",
            borderRadius: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#060913",
            cursor: "pointer"
          }}>
            →
          </button>
        </div>

        {/* Interface Category Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.6rem" }}>
          {["✈️ Flights", "🏨 Hotels", "📶 eSIM & Internet", "🎟️ Tours & Activities", "🚗 Car Rentals", "🛒 Marketplace"].map((pill) => (
            <span key={pill} style={{
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              fontSize: "0.8rem",
              color: "#d1d5db"
            }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* --- Safe Marquee Display Area --- */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <div style={{ width: "100%", padding: "3rem 0", zIndex: 10 }}>
          <PartnerMarquee partnersData={initialPartnersList} />
        </div>
      )}

      {/* Footer System Info */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", zIndex: 10, width: "100%", paddingBottom: "2rem" }}>
        Directly connecting you with Booking.com, Aviasales, Amazon and 130+ vetted global networks.
      </div>

      <Footer />
    </div>
  );
}
