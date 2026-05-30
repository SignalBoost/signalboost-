import PartnerDescription from '@/components/PartnerDescription';
import partners from '@/public/partners.json';

export const metadata = {
  title: 'Our Partners | SignalBoost',
  description: 'Browse SignalBoost business partners, categories, descriptions, and partner links.',
};

export default function PartnersPage() {
  return <PartnerDescription partners={partners} />;
}
