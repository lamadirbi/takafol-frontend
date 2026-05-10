'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useCamp } from '@/context/CampContext';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';
import { cn } from '@/lib/utils';
import BackButton from '@/components/ui/BackButton';
import InstallPwaButton from '@/components/ui/InstallPwaButton';

function buildSectionLinks(campSlug) {
  const base = campSlug ? `/${campSlug}` : '';
  const hashBase = base || '/';
  return [
    { href: base ? `${base}/news` : '/news', key: 'news', label: 'أخبار المخيم' },
  ];
}

/**
 * @param {'auto' | 'all' | 'news' | 'none'} secondaryNav
 *   auto: الرئيسية = كل الروابط؛ باقي الصفحات = «أخبار المخيم» فقط (ما عدا تسجيل الدخول = لا شيء).
 */
function resolveSecondaryNavKeys(secondaryNav, pathname, campSlug) {
  const sectionKeys = buildSectionLinks(campSlug).map((l) => l.key);
  const base = campSlug ? `/${campSlug}` : '';
  const isCampHome = Boolean(campSlug && pathname === base);
  const isGlobalHome = pathname === '/';
  const isLandingHome = isGlobalHome || isCampHome;

  if (secondaryNav === 'all') return sectionKeys;
  if (secondaryNav === 'news') return ['news'];
  if (secondaryNav === 'none') return [];
  if (secondaryNav === 'auto') {
    if (isLandingHome) return sectionKeys;
    if (pathname.includes('/login')) return [];
    if (pathname === '/news' || pathname.endsWith('/news')) return [];
    return ['news'];
  }
  return sectionKeys;
}

export default function Header({
  title,
  subtitle,
  /** عند false يُخفى الشعار المركزي في الصفحة الرئيسية */
  showLogo = true,
  showCenterLogo = true,
  /** تحكم صريح بروابط الأقسام: auto (افتراضي) أو all | news | none */
  secondaryNav = 'auto',
}) {
  const pathname = usePathname();
  const { camp } = useCamp() || {};
  const sectionLinks = useMemo(() => buildSectionLinks(camp?.slug), [camp?.slug]);
  const homeHref = camp?.slug ? `/${camp.slug}` : '/';
  const isHome = pathname === homeHref;
  // كان الشعار سابقاً "عائماً" فوق الروابط وقد يغطي الأزرار.
  // نجعله داخل الشريط بشكل جانبي لتفادي التداخل.
  const overlapLogo = false;
  const inlineLogo = isHome && showLogo;

  const campName = camp?.name || 'تَكافل - مخيم طيبة التربوي';
  const campLogo = camp?.logo_path || DEFAULT_BRAND_LOGO;

  const effectiveTitle =
    title != null && title !== ''
      ? title
      : !isHome && !subtitle
        ? campName
        : undefined;

  const navClass = (active) =>
    cn(
      'rounded-full px-3 py-2 text-sm font-semibold transition-colors outline-none',
      active
        ? 'bg-white text-primary shadow-sm ring-1 ring-white/60'
        : 'border border-white/25 bg-white/5 text-white/95 hover:bg-white/12 hover:ring-1 hover:ring-white/30'
    );

  const secondaryKeys = new Set(resolveSecondaryNavKeys(secondaryNav, pathname, camp?.slug));
  const secondaryLinksToShow = sectionLinks.filter((l) => secondaryKeys.has(l.key));
  const onNews =
    pathname === '/news' || pathname.endsWith('/news');

  return (
    <header className="relative z-40 shrink-0 text-white">
      <div className="absolute inset-0 bg-linear-to-b from-(--header-bar) to-[#214a6d]" />
      <div className="absolute inset-0 border-b border-white/10" />
      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 pt-3',
          'pb-3'
        )}
      >
        <div
          className={cn(
            'relative grid min-h-12 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3',
            'px-0'
          )}
          dir="rtl"
        >
          {/* يمين الصفحة (بداية RTL): رجوع */}
          <div className="flex min-h-10 shrink-0 items-center justify-self-start">
            {!isHome ? (
              <BackButton />
            ) : inlineLogo ? (
              <Link
                href={homeHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-2.5 py-1.5 shadow-sm hover:bg-white/12 hover:ring-1 hover:ring-white/30"
                aria-label="العودة للرئيسية"
                title="الرئيسية"
              >
                <Image
                  src={campLogo}
                  alt={campName}
                  width={40}
                  height={40}
                  priority
                  className="h-8 w-8 rounded-full bg-white p-0.5 object-contain"
                />
                <span className="hidden sm:inline text-sm font-semibold text-white/95">{camp?.name || 'تَكافل'}</span>
              </Link>
            ) : null}
          </div>

          {/* الوسط: روابط الأقسام حسب الصفحة */}
          <nav
            className="flex min-w-0 flex-wrap items-center justify-center gap-1 sm:gap-1.5"
            aria-label="روابط رئيسية"
          >
            {secondaryLinksToShow.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={navClass(item.key === 'news' && onNews)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* يسار الصفحة (نهاية RTL): الرئيسية */}
          <nav
            className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5 justify-self-end"
            aria-label="تنقل المستخدم"
          >
            <InstallPwaButton />
            <Link href={homeHref} className={navClass(isHome)}>
              الرئيسية
            </Link>
          </nav>
        </div>

        {!overlapLogo && (effectiveTitle || subtitle) ? (
          <div
            className="mt-2 border-t border-white/10 pt-3 text-right"
            dir="rtl"
          >
            {effectiveTitle ? (
              <p className="text-base font-bold text-white">{effectiveTitle}</p>
            ) : null}
            {subtitle ? (
              <p
                className={
                  effectiveTitle
                    ? 'mt-0.5 text-sm font-medium text-white/75'
                    : 'text-base font-semibold text-white/95'
                }
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
