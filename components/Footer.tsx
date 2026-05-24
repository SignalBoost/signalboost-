// components/Footer.tsx
import React from "react";

export default function Footer() {
  const columnStyle = { display: "flex", flexDirection: "column" as const, gap: "0.5rem" };
  const linkStyle = { color: "#9ca3af", textDecoration: "none", fontSize: "0.75rem" };
  const titleStyle = { fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af", uppercase: true, marginBottom: "0.5rem", letterSpacing: "0.05em" };

  return (
    <footer style={{
      width: "100%",
      maxWidth: "64rem",
      margin: "4rem auto 0 auto",
      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      paddingTop: "2rem",
      paddingBottom: "3rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      zIndex: 10,
      position: "relative"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        <div style={columnStyle}>
          <h4 style={titleStyle}>TRANSIT</h4>
          <a href="/partners/flights" style={linkStyle}>Flights Department</a>
          <a href="/partners/car_rentals" style={linkStyle}>Car Rental Hub</a>
          <a href="/partners/transfers" style={linkStyle}>Airport Transfers</a>
        </div>
        <div style={columnStyle}>
          <h4 style={titleStyle}>CONNECTIVITY</h4>
          <a href="/partners/esim" style={linkStyle}>SIM & eSIM Cards</a>
          <a href="/partners/hotels" style={linkStyle}>Hotels & Lodging</a>
        </div>
        <div style={columnStyle}>
          <h4 style={titleStyle}>MARKETPLACE</h4>
          <a href="/partners/products_tools" style={linkStyle}>Digital Tools & VPNs</a>
          <a href="/partners/marketplace" style={linkStyle}>Global Marketplaces</a>
          <a href="/partners/finance" style={linkStyle}>Financial Services</a>
        </div>
        <div style={columnStyle}>
          <h4 style={titleStyle}>PLATFORM</h4>
          <span style={{ color: "#4b5563", fontSize: "0.75rem" }}>SignalBoost © 2026</span>
          <span style={{ color: "#4b5563", fontSize: "0.75rem" }}>AI Digital Shopping Mall</span>
        </div>
      </div>
    </footer>
  );
}
