'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ICONS } from '@/components/ui/Icons';

export default function AdminMobileNav() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const base = campSlug ? `/${campSlug}` : '';

  const links = [
    { href: `${base}/admin/dashboard`, label: 'اليوم', icon: 'home', match: 'prefix' },
    { href: `${base}/admin/families`, label: 'العائلات', icon: 'family', match: 'prefix' },
    { href: `${base}/admin/filter`, label: 'فلترة', icon: 'filter', match: 'exact' },
    { href: `${base}/admin/change-requests`, label: 'طلبات', icon: 'clipboard', match: 'exact' },
    { href: `${base}/news`, label: 'أخبار', icon: 'megaphone', match: 'news' },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgba(0,0,0,0.06)] md:hidden"
      aria-label="تنقل الإدارة"
      dir="rtl"
    >
      <div className="grid grid-cols-5">
        {links.map((l) => {
          const Icon = NAV_ICONS[l.icon] || NAV_ICONS.home;
          const active =
            l.match === 'news'
              ? pathname === l.href || pathname?.endsWith('/news')
              : l.match === 'exact'
                ? pathname === l.href
                : pathname === l.href || pathname?.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]',
                active ? 'font-semibold text-primary' : 'text-[#65676B]'
              )}
            >
              <Icon className="h-6 w-6" />
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
