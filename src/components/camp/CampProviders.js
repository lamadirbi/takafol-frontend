'use client';

import { CampProvider } from '@/context/CampContext';
import { FamilyFeedProvider } from '@/context/FamilyFeedContext';

export default function CampProviders({ campSlug, children }) {
  return (
    <CampProvider campSlug={campSlug}>
      <FamilyFeedProvider>{children}</FamilyFeedProvider>
    </CampProvider>
  );
}
