// Example layout update logic inside your main home file
import React from "react";
import PartnerMarquee from "@/components/PartnerMarquee";

// Pull dataset from your local data stream array cleanly
import initialPartnersList from "@/public/partners.json"; 

export default function HomeNextPage() {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-between relative">
      
      {/* 1. KEEP YOUR EXISTING CONTAINER UNALTERED */}
      {/* Your current header, search container fields, category pills go here */}
      
      {/* 2. ADD THE SAFELY CONTAINER MARQUEE LAYER DIRECTLY UNDER YOUR BUTTON PILLS */}
      {initialPartnersList && initialPartnersList.length > 0 && (
        <PartnerMarquee partnersData={initialPartnersList} />
      )}

      {/* 3. KEEP YOUR BOTTOM ALERTS & RETENTION CARDS UNALTERED */}
    </div>
  );
}
