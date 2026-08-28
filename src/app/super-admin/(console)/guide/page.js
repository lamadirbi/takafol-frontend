'use client';

import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import UserGuide from '@/components/guide/UserGuide';
import { superAdminGuideSections } from '@/components/guide/superAdminGuide';

export default function SuperAdminUserGuidePage() {
  return (
    <SuperAdminShell title="دليل الاستخدام" description="كل أقسام إدارة المنصة">
      <UserGuide
        kicker="المنصة"
        title="دليل المنصة"
        intro="المخيمات، الطلبات، الرسائل، والتجديد."
        sections={superAdminGuideSections()}
      />
    </SuperAdminShell>
  );
}
