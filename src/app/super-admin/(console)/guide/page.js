'use client';

import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import UserGuide from '@/components/guide/UserGuide';
import { superAdminGuideSections } from '@/components/guide/superAdminGuide';

export default function SuperAdminUserGuidePage() {
  return (
    <SuperAdminShell title="دليل الاستخدام" description="كل أقسام إدارة المنصة">
      <UserGuide
        kicker="إدارة المنصة"
        title="دليل استخدام الإدارة العليا"
        intro="خطوات العمل على المخيمات، طلبات التسجيل، رسائل التواصل، وتجديد الاشتراك."
        sections={superAdminGuideSections()}
      />
    </SuperAdminShell>
  );
}
