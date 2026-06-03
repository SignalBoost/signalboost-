"use client";

import Concierge from "@/components/Concierge";
import useTranslation from "@/components/i18n/useTranslation";

export default function AssistantPageContent() {
  const { t } = useTranslation();
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#04070d 0%,#0d1117 55%,#05070b 100%)",
      color: "#fff",
      fontFamily: "Arial,Helvetica,sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <Concierge />
    </main>
  );
}
