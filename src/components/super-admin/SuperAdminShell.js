'use client';

import { usePathname } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import LogoutButton from '@/components/ui/LogoutButton';
import BackButton from '@/components/ui/BackButton';
import InstallPwaButton from '@/components/ui/InstallPwaButton';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function SuperAdminShell({ title, description, actions, children, extras, backHref }) {
  const pathname = usePathname();
  const { logoutAdmin } = useAuth();
  const isHub = pathname === '/super-admin';
  const fallback = backHref || (isHub ? '/' : '/super-admin');

  return (
    <RoleGuard realm="admin" roles={['admin']} requireSuper>
      <div className="flex min-h-dvh flex-col bg-[#F0F2F5] font-sans" dir="rtl">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-black/8 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)] md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BackButton fallbackHref={fallback} />
            <Link href="/" className="min-w-0">
              <p className="text-xs font-bold text-primary">تَكافل</p>
              <h1 className="truncate text-[17px] font-bold tracking-tight">
                {title || 'إدارة المنصة'}
              </h1>
              {description ? (
                <p className="truncate text-sm text-[#65676B]">{description}</p>
              ) : null}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/super-admin/guide"
              className="inline-flex min-h-10 items-center rounded-lg bg-[#E4E6EB] px-3 text-sm font-semibold text-foreground hover:bg-[#d8dadf]"
            >
              دليل الاستخدام
            </Link>
            <InstallPwaButton variant="header" />
            <LogoutButton
              label="خروج"
              className="rounded-lg"
              onLogout={() => logoutAdmin('/super-admin/login')}
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:py-8">
          {actions ? <div className="mb-5 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}
          {children}
        </main>
        {extras}
      </div>
    </RoleGuard>
  );
}
