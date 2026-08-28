'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ICONS, IconClose } from '@/components/ui/Icons';
import { useFamilyFeed } from '@/context/FamilyFeedContext';

function isActive(pathname, item) {
  if (!pathname) return false;
  if (item.match === 'news') return pathname === item.href || pathname.endsWith('/news');
  if (item.match === 'notif') return pathname === item.href || pathname.startsWith(item.href);
  if (item.match === 'profile') return pathname === item.href || pathname.startsWith(item.href);
  if (item.match === 'requests') return pathname.includes('/family/change-request');
  if (item.match === 'guide') return pathname === item.href || pathname.startsWith(item.href);
  return pathname === item.href;
}

export default function FamilyMobileNav() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const { unreadCount } = useFamilyFeed();
  const [moreOpen, setMoreOpen] = useState(false);
  const base = campSlug ? `/${campSlug}` : '';
  const dashHref = `${base}/family/dashboard`;
  const newsHref = `${base}/news`;
  const notifHref = `${base}/family/notifications`;

  const primary = [
    { href: newsHref, label: 'الرئيسية', icon: 'home', match: 'news' },
    { href: notifHref, label: 'الإشعارات', icon: 'bell', match: 'notif', badge: unreadCount },
    { href: dashHref, label: 'ملفي', icon: 'user', match: 'profile' },
  ];

  const moreLinks = [
    { href: `${base}/family/change-requests`, label: 'الطلبات', icon: 'clipboard', match: 'requests' },
    { href: `${base}/family/guide`, label: 'دليل الاستخدام', icon: 'info', match: 'guide' },
    { href: base || '/', label: 'صفحة المخيم', icon: 'building', match: 'camp' },
  ];

  const moreActive = moreLinks.some((item) => isActive(pathname, item));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="المزيد">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق القائمة"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[calc(5.5rem+env(safe-area-inset-bottom))] shadow-xl"
            dir="rtl"
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-3">
              <p className="text-sm font-semibold text-foreground">المزيد</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground"
                aria-label="إغلاق"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 px-3 pb-3" aria-label="روابط إضافية">
              {moreLinks.map((item) => {
                const Icon = NAV_ICONS[item.icon] || NAV_ICONS.home;
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-sm',
                      active ? 'bg-black/6 font-semibold text-foreground' : 'text-foreground hover:bg-black/5'
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgba(0,0,0,0.06)] md:hidden"
        aria-label="تنقل الأسرة"
        dir="rtl"
      >
        <div className="grid grid-cols-4">
          {primary.map((l) => {
            const Icon = NAV_ICONS[l.icon] || NAV_ICONS.home;
            const active = isActive(pathname, l);
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
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-current={moreActive ? 'page' : undefined}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]',
              moreActive || moreOpen ? 'font-semibold text-primary' : 'text-[#65676B]'
            )}
          >
            <NAV_ICONS.menu className="h-6 w-6" />
            المزيد
          </button>
        </div>
      </nav>
    </>
  );
}
