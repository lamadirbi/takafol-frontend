'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from '@/components/ui/LogoutButton';
import { NAV_ICONS } from '@/components/ui/Icons';

export default function Sidebar() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const { adminUser, logoutAdmin } = useAuth();

  const base = campSlug ? `/${campSlug}` : '';

  const daily = [
    { href: `${base}/admin/dashboard`, label: 'اليوم', icon: 'home', match: 'prefix' },
    { href: `${base}/admin/families`, label: 'سجل العائلات', icon: 'family', match: 'prefix' },
    { href: `${base}/admin/family-fields`, label: 'حقول العائلات', icon: 'list', match: 'exact' },
    { href: `${base}/admin/filter`, label: 'فلترة للتوزيع', icon: 'filter', match: 'exact' },
    { href: `${base}/admin/change-requests`, label: 'طلبات التعديل', icon: 'clipboard', match: 'exact' },
  ];

  const archive = [
    { href: `${base}/admin/camp-records`, label: 'سجلات الفلترة', icon: 'folder', match: 'exact' },
    { href: `${base}/news`, label: 'الأخبار', icon: 'megaphone', match: 'exact' },
  ];

  if (adminUser?.role === 'admin') {
    archive.push({
      href: `${base}/admin/admins`,
      label: 'المسؤولون',
      icon: 'shield',
      match: 'prefix',
    });
  }

  function isActive(item) {
    if (!pathname) return false;
    if (item.match === 'exact') return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const adminLoginPath = campSlug ? `/${campSlug}/login/admin` : '/login';

  function NavList({ items }) {
    return items.map((item) => {
      const active = isActive(item);
      const Icon = NAV_ICONS[item.icon] || NAV_ICONS.home;
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors',
            active ? 'bg-black/6 font-semibold text-foreground' : 'text-foreground hover:bg-black/5'
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <span className="truncate">{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto px-3 py-4 md:flex">
      <div className="mb-3 px-2">
        <Link href="/" className="block">
          <p className="text-[15px] font-bold text-primary">تَكافل</p>
        </Link>
        <p className="text-sm font-semibold text-foreground">لوحة الإدارة</p>
      </div>
      <nav className="flex flex-1 flex-col" dir="rtl">
        <p className="px-2 pb-1 text-xs font-semibold text-[#65676B]">العمل اليومي</p>
        <div className="flex flex-col gap-0.5">
          <NavList items={daily} />
        </div>
        <p className="mt-4 px-2 pb-1 text-xs font-semibold text-[#65676B]">السجل</p>
        <div className="flex flex-col gap-0.5">
          <NavList items={archive} />
        </div>
      </nav>
      <div className="pt-3" dir="rtl">
        <LogoutButton className="w-full rounded-xl" onLogout={() => logoutAdmin(adminLoginPath)} />
      </div>
    </aside>
  );
}
