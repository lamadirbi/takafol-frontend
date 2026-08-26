'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { REALM_ADMIN, REALM_FAMILY, getAuthCampSlug, isGlobalSuperAdmin } from '@/lib/authSession';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';
import PublicNav from '@/components/layout/PublicNav';
import InstallPwaButton from '@/components/ui/InstallPwaButton';
import AccountMenu from '@/components/ui/AccountMenu';
import { IconMenu } from '@/components/ui/Icons';

export default function PublicShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { camp } = useCamp() || {};
  const { familyUser, adminUser, logoutFamily, logoutAdmin } = useAuth();
  const homeHref = '/';
  const familySlug = camp?.slug || getAuthCampSlug(REALM_FAMILY);
  const adminSlug = camp?.slug || getAuthCampSlug(REALM_ADMIN);
  const showFamilyMenu = Boolean(familyUser);
  const showAdminMenu = Boolean(adminUser && !isGlobalSuperAdmin(adminUser) && adminUser.camp_id != null);
  const brandName = camp?.name || 'تَكافل';
  const brandLogo = camp?.logo_path || DEFAULT_BRAND_LOGO;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F0F2F5]">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-3" dir="rtl">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground md:hidden"
            aria-label="فتح القائمة"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <Link href={homeHref} className="flex min-w-0 items-center gap-2">
            <Image
              src={brandLogo}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-black/10 bg-white object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-primary">تَكافل</p>
              <p className="truncate text-xs text-[#65676B]">{brandName}</p>
            </div>
          </Link>
          <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-x-auto">
            {pathname === '/' ? (
              <>
                <a
                  href="#register"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:brightness-95 sm:px-3 sm:text-sm"
                >
                  التسجيل
                </a>
                <a
                  href="#contact"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-[#E4E6EB] px-2.5 text-xs font-semibold text-foreground hover:bg-[#d8dadf] sm:px-3 sm:text-sm"
                >
                  تواصل
                </a>
                <Link
                  href="/super-admin/login"
                  className="hidden min-h-10 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground sm:inline-flex"
                >
                  الإدارة العليا
                </Link>
              </>
            ) : null}
            <InstallPwaButton variant="header" />
            {showFamilyMenu ? (
              <AccountMenu
                name={familyUser.name}
                profileHref={familySlug ? `/${familySlug}/family/dashboard` : '/'}
                profileLabel="حسابي"
                onLogout={() => logoutFamily(familySlug ? `/${familySlug}/login` : '/')}
              />
            ) : showAdminMenu ? (
              <AccountMenu
                name={adminUser.name}
                profileHref={adminSlug ? `/${adminSlug}/admin/dashboard` : '/'}
                profileLabel="لوحة الإدارة"
                onLogout={() => logoutAdmin(adminSlug ? `/${adminSlug}/login/admin` : '/')}
              />
            ) : null}
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="القائمة">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 w-[min(18rem,86vw)] bg-[#F0F2F5] shadow-xl">
            <PublicNav onNavigate={() => setOpen(false)} onClose={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto md:flex md:flex-col">
          <PublicNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
