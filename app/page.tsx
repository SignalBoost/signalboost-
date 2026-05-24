// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer";
import initialPartnersList from "@/public/partners.json";

// Explicitly import your home style sheets for the slow keyframe animations
import "./home.css"; 

export default function HomePage() {
  return (
    <div style={{
      backgroundColor: "#060913",
      minHeight: "100vh",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      overflowX: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
      paddingTop: "8rem",  /* Gives plenty of space below your real top navbar */
      paddingBottom: "2rem"
    }}>
      
      {/* Premium Ambient Background Glow */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "1000px",
        height: "400px",
        background: "linear-gradient(to bottom, rgba(245, 158, 11, 0.06), transparent)",
        borderRadius: "50%",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Main Core View Area */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: "42rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        zIndex: 10,
        width: "100%",
        marginBottom: "3rem"
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

        {/* Custom Search Bar Container */}
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

      {/* --- MARQUEE CONTAINER (Pushed to flow naturally, preventing vertical overflow clipping) --- */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <div style={{ width: "100%", zIndex: 10, padding: "2rem 0", contentVisibility: "auto" }}>
          <PartnerMarquee partnersData={initialPartnersList} />
        </div>
      )}

      {/* Bottom Context Footprint */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", zIndex: 10, width: "100%", padding: "2rem 0 1rem 0" }}>
        Directly connecting you with Booking.com, Aviasales, Amazon and 130+ vetted global networks.
      </div>

      <Footer />
    </div>
  );
}
