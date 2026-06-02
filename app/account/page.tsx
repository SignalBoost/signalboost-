export const metadata = { title: "Account Settings | SignalBoost" };

export default function AccountPage() {
  return (
    <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06060a", color: "#e6edf3", fontFamily: "system-ui, sans-serif", padding: "40px 18px", textAlign: "center" }}>
      <div style={{ maxWidth: 460 }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#dfa837", margin: "0 0 10px" }}>Account</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 12px" }}>Account Settings</h1>
        <p style={{ color: "#9aa8b8", fontSize: 15, lineHeight: 1.6, margin: 0 }}>This page is coming soon. You&apos;ll be able to manage your profile, email, and preferences here.</p>
      </div>
    </main>
  );
}
