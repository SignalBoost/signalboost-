import HomeApp from '../components/home/HomeApp';
import '../app/home-next/home.css';

export const metadata = {
  title: 'SignalBoost — Your AI-guided digital shopping mall',
  description: 'Tell our AI concierge what you need and get matched to trusted partners serving your region.',
};

export default function Page() {
  return (
    <main className="sb-home">
      <div className="sb-home-bg" />
      <HomeApp lang="en" />
    </main>
  );
}
