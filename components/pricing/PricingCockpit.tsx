// File: components/pricing/PricingCockpit.tsx
// Project: SignalBoost (main production repo)

export default function PricingCockpit() {
  const tiers = [
    {
      name: 'Starter',
      price: '$19/mo',
      features: ['Marketplace access', 'Basic Reviews', 'Calendar'],
    },
    {
      name: 'Growth',
      price: '$49/mo',
      features: [
        'Marketplace access',
        'Reviews + Promote Business',
        'Calendar + Spreadsheets',
        'Outreach tools',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'All SaaS modules',
        'Personal Assistant',
        'Executive Dashboard',
        'Dedicated Concierge AI',
      ],
    },
  ];

  return (
    <section className="bg-black text-white min-h-screen p-12">
      <h2 className="text-3xl font-bold mb-8">
        Pricing <span className="text-green-400">Cockpit</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="cockpit-panel flex flex-col items-center"
          >
            <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
            <p className="text-green-400 mb-4">{tier.price}</p>
            <ul className="space-y-2">
              {tier.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .cockpit-panel {
          background: rgba(0, 128, 0, 0.2);
          border: 1px solid #22c55e;
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.3s ease;
        }
        .cockpit-panel:hover {
          background: rgba(34, 197, 94, 0.4);
          color: #22c55e;
        }
      `}</style>
    </section>
  );
}
