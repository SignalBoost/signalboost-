// app/page.tsx
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";
import Footer from "@/components/Footer";
import initialPartnersList from "@/public/partners.json";

// Import your custom homepage stylesheet explicitly to make sure it loads
import "./home.css"; 

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-between pt-24 pb-12 relative overflow-hidden">
      
      {/* Main Core Hero Content Area */}
      <div className="flex flex-col items-center text-center max-w-3xl px-4 z-10 flex-grow justify-center w-full">
        <h1 className="text-5xl font-bold tracking-tight text-amber-400 mb-2">
          SignalBoost
        </h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-6">
          Your AI-Guided Digital Shopping Mall
        </h2>
        <p className="text-gray-400 text-base max-w-2xl leading-relaxed mb-8">
          Tell me what you need and I’ll guide you to the right trusted partner — flights, hotels, eSIMs, cars and more, matched perfectly to your country.
        </p>

        {/* Your Original Functional Search Bar Input Structure */}
        <div className="w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl mb-6 relative z-20">
          <input 
            type="text" 
            placeholder='Try typing: "flights to Lima next month"' 
            className="w-full bg-transparent border-none outline-none pl-4 text-sm text-gray-200 placeholder-gray-500"
            disabled
          />
          <button className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-black">
            →
          </button>
        </div>

        {/* Live Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl text-xs text-gray-300">
          <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">✈️ Flights</span>
          <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">🏨 Hotels</span>
          <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">📶 eSIM & Internet</span>
          <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">🎟️ Tours & Activities</span>
          <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">🚗 Car Rentals</span>
          <span className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">🛒 Marketplace</span>
        </div>
      </div>

      {/* Dynamic Scroller Section wrapper container */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <div className="w-full z-10 my-8">
          <PartnerMarquee partnersData={initialPartnersList} />
        </div>
      )}

      {/* Footer System Links */}
      <Footer />
      
    </div>
  );
}
