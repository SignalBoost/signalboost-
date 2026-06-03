import Link from "next/link";
import ModuleGrid from "@/components/ModuleGrid";

export const metadata = { title: "SaaS Station | SignalBoost" };

export default function SaasStationPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#04070d 0%,#0d1117 55%,#05070b 100%)",
      color: "#fff",
      fontFamily: "Arial,Helvetica,sans-serif",
      paddingBottom: 60,
    }}>
      {/* Compact page header */}
      <div style={{
        width: "min(1180px, calc(100% - 32px))",
        margin: "0 auto",
        padding: "24px 0 16px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 24,
      }}>
        <div>
          <p style={{ color: "#f5c542", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>SaaS Station</p>
          <h1 style={{ fontSize: "clamp(20px, 3vw, 34px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px", lineHeight: 1.1 }}>
            Run your growth operations from one station
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0, maxWidth: 520 }}>
            Launch campaigns, manage spreadsheets, monitor reviews, coordinate calendars, and route work through the SignalBoost assistant.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/assistant" style={{ background: "#f5c542", color: "#11151c", borderRadius: 999, fontWeight: 900, fontSize: 12, padding: "9px 16px", textDecoration: "none" }}>Open Concierge</Link>
          <Link href="/dashboard" style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, fontWeight: 900, fontSize: 12, padding: "9px 16px", textDecoration: "none" }}>Dashboard</Link>
        </div>
      </div>

      {/* Module grid — straight to the tools */}
      <div style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto" }}>
        <ModuleGrid />
      </div>
    </main>
  );
}
