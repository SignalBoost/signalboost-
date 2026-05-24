// app/partners/[category]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import initialPartnersList from "@/public/partners.json";

// Next.js 15 explicitly requires params to be typed as a Promise
interface Props {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: Props) {
  // Await the asynchronous params object before unpacking its parameters
  const resolvedParams = await params;
  const { category } = resolvedParams;

  // Filter out partners belonging exclusively to this path's category context
  const filteredPartners = initialPartnersList.filter(
    (p) => p.category_key === category
  );

  // Fallback safely to a 404 page if a user attempts to look up an invalid route
  if (filteredPartners.length === 0) {
    notFound();
  }

  // Grab user-friendly layout naming strings directly from your schema metadata
  const categoryLabel = filteredPartners[0].category_label;

  return (
    <div className="min-h-screen bg-[#060913] text-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* --- DYNAMIC MARKETING HEADER AREA (Optimized for Search Engine Crawlers) --- */}
        <header className="mb-12 border-b border-white/5 pb-8">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            SignalBoost Directory
          </span>
          <h1 className="text-4xl font-bold mt-2 mb-4 tracking-tight">
            Top Regional {categoryLabel} Providers & Partners
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
            Compare premium, trusted global infrastructure operators and localized regional vendors for{" "}
            <span className="text-white font-medium">{categoryLabel.toLowerCase()}</span>. 
            Find secure matching options suited directly to your global itinerary.
          </p>
        </header>

        {/* --- DYNAMIC INFORMATION EXTRACTION TABLE (Optimized for AI Search & GEO) --- */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Marketplace Overview & Verification Tier List
          </h2>
          <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 font-medium">
                  <th className="p-4">Partner Brand</th>
                  <th className="p-4">Supported Operational Network</th>
                  <th className="p-4">Verification Quality Tier</th>
                  <th className="p-4">Regional Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-semibold text-white">{partner.name}</td>
                    <td className="p-4 text-gray-400">{partner.network}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                        partner.tier === 1 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        Tier {partner.tier}
                      </span>
                    </td>
                    <td className="p-4">
                      <a 
                        href={partner.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline inline-flex items-center gap-1"
                      >
                        Visit Store →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- GRID DISPLAY CARDS LAYER (The User Window Shopping Interface) --- */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-gray-200">
            Available Integrated Storefronts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => {
              const cleanDomain = partner.name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
              return (
                <div 
                  key={partner.id}
                  className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-md flex flex-col justify-between h-52 transition-all duration-300 hover:border-amber-500/20 hover:bg-white/[0.02]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <img
                        src={`https://cdn.brandfetch.io/${cleanDomain}`}
                        alt={partner.name}
                        className="h-6 object-contain opacity-70 filter brightness-125"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                        {partner.network}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-white">{partner.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                  
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium transition-all duration-300 hover:bg-amber-500 hover:text-black hover:border-transparent"
                  >
                    Open Storefront
                  </a>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
