// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer"; // <-- Add this Import statement

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-between relative">
      
      {/* Your current Hero and search layout */}
      
      {/* Your live loop partners layer */}
      <PartnerMarquee />

      {/* --- ADD THE FOOTER HERE AT THE VERY BOTTOM --- */}
      <Footer /> 
      
    </div>
  );
}
