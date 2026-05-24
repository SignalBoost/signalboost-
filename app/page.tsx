// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer";
import initialPartnersList from "@/public/partners.json";

// Force Next.js to apply our custom slow marquee keyframe loop animations
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
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      
      {/* --- PREMIUM NAVIGATION BAR / LOGO RESTORATION LAYER --- */}
      <header style={{
        width: "100%",
        maxWidth: "80rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.5rem 2rem",
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50
      }}>
        {/* Left Side: Restored Brand Identity Typography */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
            signal<span style={{ color: "#f59e0b" }}>boost</span>
          </span>
        </div>

        {/* Right Side: Restored Authentication Context Actions Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a href="/admin" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}>
            ⚙️ Admin
          </a>
          <a href="/dashboard" style={{ 
            backgroundColor: "#f59e0b", 
            color: "#060913", 
            textDecoration: "none", 
            fontSize: "0.85rem", 
            fontWeight: 600,
            padding: "0.5rem 1rem", 
            borderRadius: "9999px",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
          }}>
            Dashboard
          </a>
          <a href="/reset-password" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}>
            Reset password
          </a>
          <a href="/logout" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}>
            Log out
          </a>
        </div>
      </header>

      {/* Premium Ambient Background Glow */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "1000px",
        height: "400px",
        background: "linear-gradient(to bottom, rgba(245, 158, 11, 0.08), transparent)",
        borderRadius: "50%",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Main Hero Container */}
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
        marginTop: "10rem", // Pushes content safely below the absolute header layout
        marginBottom: "auto"
      }}>
        <h1 style={{ 
          fontSize: "3.5rem", 
          fontWeight: 800, 
          letterSpacing: "-0.02em",
          color: "#f59e0b", 
          marginBottom: "0.25rem",
          textShadow: "0 0 40px rgba(245, 158, 11, 0.2)"
        }}>
          SignalBoost
        </h1>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#f3f4f6", marginBottom: "1.5rem" }}>
          Your AI-Guided Digital Shopping Mall
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: "1.6rem", marginBottom: "2.5rem" }}>
          Tell me what you need and I’ll guide you to the right trusted partner — flights, hotels, eSIMs, cars and more, matched perfectly to your country.
        </p>

        {/* Premium Frosted Search Container */}
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
            fontSize: "1.1rem",
            cursor: "pointer"
          }}>
            →
          </button>
        </div>

        {/* Category Badges */}
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

      {/* Scrolling Window Shopping Layers loaded from partners.json */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <div style={{ width: "100%", zIndex: 10, marginTop: "2rem" }}>
          <PartnerMarquee partnersData={initialPartnersList} />
        </div>
      )}

      {/* Sub-text notice */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#4b5563", zIndex: 10, marginTop: "1rem", letterSpacing: "0.02em" }}>
        Directly connecting you with Booking.com, Aviasales, Amazon and 130+ vetted global networks.
      </div>

      <Footer />
    </div>
  );
}
