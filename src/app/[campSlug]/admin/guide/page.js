'use client';

import { useParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import UserGuide from '@/components/guide/UserGuide';
import { adminGuideSections } from '@/components/guide/adminGuide';
import { useCamp } from '@/context/CampContext';

export default function AdminUserGuidePage() {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const base = campSlug ? `/${campSlug}` : '';

  return (
    <AdminShell title="دليل الاستخدام" subtitle={camp?.name}>
      <div className="mx-auto max-w-3xl">
        <UserGuide
          kicker="لوحة الإدارة"
          title="دليل استخدام إدارة المخيم"
          intro="كل ميزة في اللوحة مشروحة هنا بالخطوات. من كل صفحة تقدروا تفتحوا دليل تلك الصفحة، أو ترجعوا لهذا الدليل الكامل."
          sections={adminGuideSections(base)}
        />
      </div>
    </AdminShell>
  );
}
