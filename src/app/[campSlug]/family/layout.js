'use client';

import RoleGuard from '@/components/auth/RoleGuard';

export default function FamilyPortalLayout({ children }) {
  return (
    <RoleGuard realm="family" roles={['family_head']}>
      {children}
    </RoleGuard>
  );
}
