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
          kicker="الإدارة"
          title="دليل الإدارة"
          intro="شو تعمل من كل صفحة. اضغط القسم اللي بدك ياه."
          sections={adminGuideSections(base)}
        />
      </div>
    </AdminShell>
  );
}
