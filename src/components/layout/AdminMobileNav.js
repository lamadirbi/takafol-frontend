'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ICONS, IconClose } from '@/components/ui/Icons';
import { useAuth } from '@/hooks/useAuth';

function isLinkActive(pathname, item) {
  if (!pathname) return false;
  if (item.match === 'news') return pathname === item.href || pathname.endsWith('/news');
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function AdminMobileNav() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const { adminUser } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const base = campSlug ? `/${campSlug}` : '';

  const primary = [
    { href: `${base}/admin/dashboard`, label: 'اليوم', icon: 'home', match: 'prefix' },
    { href: `${base}/admin/families`, label: 'العائلات', icon: 'family', match: 'prefix' },
    { href: `${base}/admin/filter`, label: 'فلترة', icon: 'filter', match: 'exact' },
    { href: `${base}/admin/change-requests`, label: 'طلبات', icon: 'clipboard', match: 'exact' },
  ];

  const moreLinks = [
    { href: `${base}/news`, label: 'الأخبار', icon: 'megaphone', match: 'news' },
    { href: `${base}/admin/camp-records`, label: 'سجلات الفلترة', icon: 'folder', match: 'exact' },
    { href: `${base}/admin/family-fields`, label: 'حقول العائلات', icon: 'list', match: 'exact' },
  ];

  if (adminUser?.role === 'admin') {
    moreLinks.push({
      href: `${base}/admin/admins`,
      label: 'المسؤولون',
      icon: 'shield',
      match: 'prefix',
    });
  }

  const moreActive = moreLinks.some((item) => isLinkActive(pathname, item));

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
                const active = isLinkActive(pathname, item);
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
        aria-label="تنقل الإدارة"
        dir="rtl"
      >
        <div className="grid grid-cols-5">
          {primary.map((l) => {
            const Icon = NAV_ICONS[l.icon] || NAV_ICONS.home;
            const active = isLinkActive(pathname, l);
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
