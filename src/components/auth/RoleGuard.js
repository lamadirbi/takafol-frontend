'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * @param {{ children: import('react').ReactNode, roles?: string[], requireSuper?: boolean }} props
 */
export default function RoleGuard({ children, roles, requireSuper = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const campSlug = params?.campSlug;
  
  useEffect(() => {
    if (loading) return;
    if (!user) {
      const base = campSlug ? `/${campSlug}` : '';
      const loginHref = pathname?.startsWith('/super-admin') ? '/super-admin/login' : pathname?.includes('/admin') ? `${base}/login/admin` : `${base}/login`;
      router.replace(loginHref);
      return;
    }
    if (requireSuper && (!user.is_super || user.camp_id != null)) {
      router.replace('/');
      return;
    }
    if (roles?.length && !roles.includes(user.role)) {
      const base = campSlug ? `/${campSlug}` : '';
      if (user.role === 'admin') {
        router.replace(`${base}/admin/dashboard`);
      } else {
        router.replace(`${base}/family/dashboard`);
      }
    }
  }, [loading, user, roles, router, pathname, campSlug, requireSuper]);

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        جاري التحقق من الصلاحيات…
      </div>
    );
  }

  if (
    !user ||
    (roles?.length && !roles.includes(user.role)) ||
    (requireSuper && (!user.is_super || user.camp_id != null))
  ) {
    return null;
  }

  return children;
}
