'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCamp } from '@/context/CampContext';
import LogoutButton from '@/components/ui/LogoutButton';

export default function AdminTopbar({ title, subtitle }) {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const { logoutAdmin } = useAuth();
  const adminLoginPath = campSlug ? `/${campSlug}/login/admin` : '/login';
  const campHome = campSlug ? `/${campSlug}` : '/';

  return (
    <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-black/8 bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      <div className="min-w-0" dir="rtl">
        <h1 className="truncate text-[17px] font-bold tracking-tight">{title}</h1>
        <p className="truncate text-xs text-[#65676B]">{subtitle || camp?.name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={campHome}
          className="hidden min-h-10 items-center rounded-lg bg-[#E4E6EB] px-3 text-sm font-semibold text-foreground hover:bg-[#d8dadf] sm:inline-flex"
        >
          صفحة المخيم
        </Link>
        <LogoutButton
          label="خروج"
          className="rounded-lg md:hidden"
          onLogout={() => logoutAdmin(adminLoginPath)}
        />
      </div>
    </header>
  );
}
