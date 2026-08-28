'use client';

import { useParams } from 'next/navigation';
import FamilyShell from '@/components/layout/FamilyShell';
import UserGuide from '@/components/guide/UserGuide';
import { familyGuideSections } from '@/components/guide/familyGuide';
import { useCamp } from '@/context/CampContext';

export default function FamilyUserGuidePage() {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const base = campSlug ? `/${campSlug}` : '';

  return (
    <FamilyShell title="دليل الاستخدام" subtitle={camp?.name} maxWidth="max-w-3xl">
      <UserGuide
        kicker="العائلة"
        title="دليل العائلة"
        intro="شو تشوف من حسابك: الملف، الأخبار، والطرود."
        sections={familyGuideSections(base)}
      />
    </FamilyShell>
  );
}
