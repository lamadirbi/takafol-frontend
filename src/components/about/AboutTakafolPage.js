'use client';

import PublicShell from '@/components/layout/PublicShell';
import Footer from '@/components/layout/Footer';
import AboutTakafolContent from '@/components/about/AboutTakafolContent';

export default function AboutTakafolPage() {
  return (
    <PublicShell>
      <AboutTakafolContent />
      <Footer />
    </PublicShell>
  );
}
