// components/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full max-w-5xl mx-auto mt-24 border-t border-white/5 pt-8 pb-12 text-xs text-gray-500 px-4 z-10 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3">Transit</h4>
          <ul className="space-y-2">
            <li><a href="/partners/flights" className="hover:text-amber-400 transition-colors">Flights Department</a></li>
            <li><a href="/partners/car_rentals" className="hover:text-amber-400 transition-colors">Car Rental Hub</a></li>
            <li><a href="/partners/transfers" className="hover:text-amber-400 transition-colors">Airport Transfers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3">Connectivity & Stay</h4>
          <ul className="space-y-2">
            <li><a href="/partners/esim" className="hover:text-amber-400 transition-colors">SIM & eSIM Cards</a></li>
            <li><a href="/partners/hotels" className="hover:text-amber-400 transition-colors">Hotels & Lodging</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3">Tools & Specialty</h4>
          <ul className="space-y-2">
            <li><a href="/partners/products_tools" className="hover:text-amber-400 transition-colors">Digital Tools & VPNs</a></li>
            <li><a href="/partners/marketplace" className="hover:text-amber-400 transition-colors">Global Marketplaces</a></li>
            <li><a href="/partners/finance" className="hover:text-amber-400 transition-colors">Financial Services</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2">
            <li><span className="text-gray-600">SignalBoost © 2026</span></li>
            <li><span className="text-gray-600">AI-Guided Shopping Mall</span></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
