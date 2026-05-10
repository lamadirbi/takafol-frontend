import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CampProvider } from '@/context/CampContext';
import CampLandingPage from '@/components/camp/CampLandingPage';

export default async function HomePage({ params }) {
  const { campSlug } = await params;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header />
      <CampLandingPage />
      <Footer />
    </div>
  );
}
