'use client';

import RoleGuard from '@/components/auth/RoleGuard';

export default function AdminPortalLayout({ children }) {
  return (
    <RoleGuard realm="admin" roles={['admin']}>
      {children}
    </RoleGuard>
  );
}
