'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCamp } from '@/context/CampContext';
import BackButton from '@/components/ui/BackButton';
import AccountMenu from '@/components/ui/AccountMenu';
import InstallPwaButton from '@/components/ui/InstallPwaButton';

export default function AdminTopbar({ title, subtitle }) {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const { adminUser, logoutAdmin } = useAuth();
  const adminLoginPath = campSlug ? `/${campSlug}/login/admin` : '/login';
  const dashHref = campSlug ? `/${campSlug}/admin/dashboard` : '/';

  return (
    <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-black/8 bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      <div className="flex min-w-0 items-center gap-2" dir="rtl">
        <BackButton fallbackHref={dashHref} className="h-10 w-10 rounded-full border-0 bg-[#E4E6EB]" />
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">{title}</h1>
          <p className="truncate text-xs text-[#65676B]">{subtitle || camp?.name}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <InstallPwaButton variant="header" />
        <Link
          href="/"
          className="hidden min-h-10 items-center rounded-lg bg-[#E4E6EB] px-3 text-sm font-semibold text-foreground hover:bg-[#d8dadf] sm:inline-flex"
        >
          الرئيسية
        </Link>
        <AccountMenu
          name={adminUser?.name || 'إدارة'}
          profileHref={dashHref}
          profileLabel="لوحة الإدارة"
          onLogout={() => logoutAdmin(adminLoginPath)}
        />
      </div>
    </header>
  );
}
