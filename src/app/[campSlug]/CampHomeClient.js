'use client';

import PublicShell from '@/components/layout/PublicShell';
import Footer from '@/components/layout/Footer';
import FamilyShell from '@/components/layout/FamilyShell';
import CampLandingPage from '@/components/camp/CampLandingPage';
import { useAuth } from '@/hooks/useAuth';
import { useCamp } from '@/context/CampContext';

export default function CampHomeClient() {
  const { familyUser } = useAuth();
  const { camp } = useCamp() || {};

  if (familyUser) {
    return (
      <FamilyShell title={camp?.name || 'المخيم'} subtitle="صفحة المخيم" maxWidth="max-w-lg">
        <CampLandingPage compact />
      </FamilyShell>
    );
  }

  return (
    <PublicShell>
      <CampLandingPage />
      <Footer />
    </PublicShell>
  );
}
