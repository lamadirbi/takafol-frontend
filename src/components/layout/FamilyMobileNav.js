'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ICONS } from '@/components/ui/Icons';
import { useFamilyFeed } from '@/context/FamilyFeedContext';

export default function FamilyMobileNav() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const { unreadCount } = useFamilyFeed();
  const base = campSlug ? `/${campSlug}` : '';
  const dashHref = `${base}/family/dashboard`;
  const newsHref = `${base}/news`;
  const notifHref = `${base}/family/notifications`;
  const requestsHref = `${base}/family/change-requests`;

  const links = [
    { href: newsHref, label: 'الرئيسية', icon: 'home', match: 'news' },
    { href: notifHref, label: 'الإشعارات', icon: 'bell', match: 'notif', badge: unreadCount },
    { href: requestsHref, label: 'الطلبات', icon: 'clipboard', match: 'requests' },
    { href: dashHref, label: 'ملفي', icon: 'user', match: 'profile' },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgba(0,0,0,0.06)] md:hidden"
      aria-label="تنقل الأسرة"
      dir="rtl"
    >
      <div className="grid grid-cols-4">
        {links.map((l) => {
          const Icon = NAV_ICONS[l.icon] || NAV_ICONS.home;
          const active =
            l.match === 'news'
              ? pathname === newsHref || pathname?.endsWith('/news')
              : l.match === 'notif'
                ? pathname === notifHref || pathname?.startsWith(notifHref)
                : l.match === 'requests'
                  ? pathname?.includes('/family/change-request')
                  : pathname === dashHref || pathname?.startsWith(dashHref);
          return (
            <Link
              key={l.match}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]',
                active ? 'font-semibold text-primary' : 'text-[#65676B]'
              )}
            >
              <span className="relative inline-flex">
                <Icon className="h-6 w-6" />
                {l.badge > 0 ? (
                  <span className="absolute -top-1 -end-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#E41E3F] px-1 text-[10px] font-bold leading-none text-white">
                    {l.badge > 9 ? '9+' : l.badge}
                  </span>
                ) : null}
              </span>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
