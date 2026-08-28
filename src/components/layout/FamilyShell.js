'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyFeed } from '@/context/FamilyFeedContext';
import { campLogoSrc, DEFAULT_BRAND_LOGO } from '@/lib/brand';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/ui/LogoutButton';
import BackButton from '@/components/ui/BackButton';
import AccountMenu from '@/components/ui/AccountMenu';
import InstallPwaButton from '@/components/ui/InstallPwaButton';
import FamilyMobileNav from '@/components/layout/FamilyMobileNav';
import {
  IconMegaphone,
  IconClipboard,
  IconBuilding,
  IconBell,
  IconUser,
  IconInfo,
} from '@/components/ui/Icons';

export function FamilyToolbar({ children, className, maxWidth = 'max-w-5xl' }) {
  return (
    <div className="border-b border-black/8 bg-white px-4 py-2.5" dir="rtl">
      <div className={cn('mx-auto flex flex-wrap items-center justify-between gap-3', maxWidth, className)}>
        {children}
      </div>
    </div>
  );
}

function initials(name) {
  const s = String(name || '').trim();
  if (!s) return 'أ';
  return s.slice(0, 1);
}

function NotifBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -end-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#E41E3F] px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

function railClass(active) {
  return cn(
    'flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors',
    active ? 'bg-black/6 font-semibold text-foreground' : 'text-foreground hover:bg-black/5'
  );
}

export default function FamilyShell({
  title,
  subtitle,
  toolbar,
  children,
  maxWidth = 'max-w-[680px]',
}) {
  const { campSlug } = useParams();
  const pathname = usePathname();
  const { camp } = useCamp() || {};
  const { familyUser, logoutFamily } = useAuth();
  const { unreadCount } = useFamilyFeed();
  const homeHref = campSlug ? `/${campSlug}` : '/';
  const dashHref = campSlug ? `/${campSlug}/family/dashboard` : '/';
  const newsHref = campSlug ? `/${campSlug}/news` : '/news';
  const notifHref = campSlug ? `/${campSlug}/family/notifications` : '/';
  const requestsHref = campSlug ? `/${campSlug}/family/change-requests` : '/';
  const guideHref = campSlug ? `/${campSlug}/family/guide` : '/';
  const brandName = camp?.name || 'تَكافل';
  const logoSrc = campLogoSrc(camp);
  const displayName = familyUser?.name || title || 'الأسرة';

  const onDash = pathname === dashHref || pathname?.startsWith(`${dashHref}`);
  const onNews = pathname === newsHref || pathname?.endsWith('/news');
  const onNotif = pathname === notifHref || pathname?.startsWith(`${notifHref}`);
  const onRequests = pathname?.includes('/family/change-request');
  const onGuide = pathname === guideHref || pathname?.startsWith(`${guideHref}`);
  const onCamp = pathname === homeHref;

  const rail = [
    { href: dashHref, label: displayName, icon: IconUser, active: onDash, avatar: true },
    { href: newsHref, label: 'الأخبار', icon: IconMegaphone, active: onNews },
    { href: notifHref, label: 'الإشعارات', icon: IconBell, active: onNotif, badge: unreadCount },
    { href: requestsHref, label: 'الطلبات', icon: IconClipboard, active: onRequests },
    { href: guideHref, label: 'دليل الاستخدام', icon: IconInfo, active: onGuide },
    { href: homeHref, label: 'صفحة المخيم', icon: IconBuilding, active: onCamp },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-[#F0F2F5]">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 px-3" dir="rtl">
          <div className="flex min-w-0 items-center gap-2">
            <BackButton fallbackHref={dashHref} className="h-10 w-10 rounded-full border-0 bg-[#E4E6EB]" />
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <Image
                src={logoSrc}
                alt=""
                width={40}
                height={40}
                unoptimized={logoSrc !== DEFAULT_BRAND_LOGO}
                className="h-10 w-10 rounded-full border border-black/10 bg-white object-contain"
              />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-[15px] font-bold text-primary">تَكافل</p>
                <p className="truncate text-xs text-[#65676B]">{subtitle || brandName}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={notifHref}
              aria-label="الإشعارات"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground hover:bg-[#d8dadf] md:inline-flex"
            >
              <IconBell className="h-5 w-5" />
              <NotifBadge count={unreadCount} />
            </Link>
            <InstallPwaButton variant="header" />
            <AccountMenu
              name={displayName}
              profileHref={dashHref}
              profileLabel="حسابي"
              extraLinks={[{ href: guideHref, label: 'دليل الاستخدام' }]}
              onLogout={() => logoutFamily(`/${campSlug}/login`)}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 flex-col overflow-y-auto px-3 py-4 md:flex">
          <nav className="flex flex-1 flex-col gap-0.5" dir="rtl">
            {rail.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? 'page' : undefined}
                  className={railClass(item.active)}
                >
                  {item.avatar ? (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {initials(displayName)}
                    </span>
                  ) : (
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground">
                      <Icon className="h-5 w-5" />
                      {item.badge ? <NotifBadge count={item.badge} /> : null}
                    </span>
                  )}
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-3" dir="rtl">
            <LogoutButton
              className="w-full rounded-xl"
              onLogout={() => logoutFamily(`/${campSlug}/login`)}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {toolbar}
          <main
            className={cn(
              'mx-auto w-full flex-1 px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-4 md:py-6 md:pb-8',
              maxWidth
            )}
            dir="rtl"
          >
            {children}
          </main>
        </div>
      </div>
      <FamilyMobileNav />
    </div>
  );
}
