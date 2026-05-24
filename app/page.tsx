// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer";
import initialPartnersList from "@/public/partners.json";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-between pt-24 pb-12 relative overflow-hidden">
      
      {/* --- BACKGROUND METAPHOR AMBIENCE FILTERS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      {/* --- MAIN CORE HERO CONCIERGE BLOCK --- */}
      <div className="flex flex-col items-center text-center max-w-3xl px-4 z-10 flex-grow justify-center w-full">
        <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-2">
          SIGNALBOOST PLATFORM
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3">
          Your AI-Guided Digital Shopping Mall
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-8">
          Tell me what you need and I’ll guide you to the right trusted partner — flights, hotels, eSIMs, cars and more, matched perfectly to your country.
        </p>

        {/* --- CONCIERGE INTERACTION CONTAINER ZONE --- */}
        <div className="w-full max-w-xl bg-white/[0.02] border border-white/5 fathom-glass-card rounded-2xl p-2 flex items-center shadow-2xl shadow-black/50 mb-6">
          <input 
            type="text" 
            placeholder='Try typing: "flights to Lima next month"' 
            className="w-full bg-transparent border-none outline-none pl-4 text-sm text-gray-200 placeholder-gray-500"
            disabled
          />
          <button className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-black hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20">
            →
          </button>
        </div>

        {/* --- LIVE UTILITY CATEGORY PILLS GRID --- */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl text-xs text-gray-300">
          <span className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04]">✈️ Flights</span>
          <span className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04]">🏨 Hotels</span>
          <span className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04]">📶 eSIM & Internet</span>
          <span className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04]">🎟️ Tours & Activities</span>
          <span className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04]">🚗 Car Rentals</span>
          <span className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04]">🛒 Marketplace</span>
        </div>
      </div>

      {/* --- DYNAMIC WINDOW SHOPPING SCROLLERS SECTION --- */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <div className="w-full z-10">
          <PartnerMarquee partnersData={initialPartnersList} />
        </div>
      )}

      {/* --- TRUST FOOTPRINT SUB-TICKER COPY --- */}
      <div className="text-center text-[11px] text-gray-600 tracking-wide z-10 my-4">
        Directly connecting you with Booking.com, Aviasales, Amazon and 120+ vetted global networks.
      </div>

      {/* --- PROGRAMMATIC SEARCH INJECTION FOOTER HUB --- */}
      <Footer />
      
    </div>
  );
}
