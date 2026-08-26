'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import { REALM_ADMIN, REALM_FAMILY, realmFromPathname } from '@/lib/authSession';

/**
 * @param {{ children: import('react').ReactNode, roles?: string[], requireSuper?: boolean, realm?: 'family'|'admin' }} props
 */
export default function RoleGuard({ children, roles, requireSuper = false, realm }) {
  const { familyUser, adminUser, familyLoading, adminLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const campSlug = params?.campSlug;

  const resolvedRealm = realm || realmFromPathname(pathname) || REALM_FAMILY;
  const user = resolvedRealm === REALM_ADMIN ? adminUser : familyUser;
  const loading = resolvedRealm === REALM_ADMIN ? adminLoading : familyLoading;

  useEffect(() => {
    if (loading) return;
    const base = campSlug ? `/${campSlug}` : '';
    const loginHref =
      resolvedRealm === REALM_ADMIN
        ? pathname?.startsWith('/super-admin')
          ? '/super-admin/login'
          : `${base}/login/admin`
        : `${base}/login`;

    if (!user) {
      router.replace(loginHref);
      return;
    }
    if (requireSuper && (!user.is_super || user.camp_id != null)) {
      router.replace(loginHref);
      return;
    }
    if (roles?.length && !roles.includes(user.role)) {
      router.replace(loginHref);
    }
  }, [loading, user, roles, router, pathname, campSlug, requireSuper, resolvedRealm]);

  if (loading && !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Spinner className="h-10 w-10 text-primary" label="جاري التحقق من الصلاحيات" />
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
