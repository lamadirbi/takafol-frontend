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
        kicker="حساب الأسرة"
        title="دليل استخدام حساب العائلة"
        intro="هذا دليلكم لكل اللي بتقدروا تعملوه من حساب رب الأسرة: الملف، الأخبار، الطرود، وطلب تعديل البيانات."
        sections={familyGuideSections(base)}
      />
    </FamilyShell>
  );
}
