import HomeApp from '../components/home/HomeApp';
import PartnerMarquee from '../components/PartnerMarquee';
import '../app/home-next/home.css';

export const metadata = {
  title: 'SignalBoost — Your SaaS Stationary Station',
  description: 'Run Calendar, Spreadsheets, Reviews, and Outreach from a gold-accented SaaS cockpit with trusted partner badges.',
};

export default function Page() {
  return (
    <main className="sb-home">
      <div className="sb-home-bg" />
      <HomeApp afterHero={<PartnerMarquee />} />
    </main>
  );
}
