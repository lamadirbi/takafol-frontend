'use client';

import Link from 'next/link';
import CampLogo from '@/components/shared/CampLogo';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { isGlobalSuperAdmin } from '@/lib/authSession';
import { IconMail, IconWhatsApp } from '@/components/ui/Icons';

const SUPPORT_EMAIL = 'lamaadirbi@gmail.com';
const SUPPORT_WA = '0592533678';

function waDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

function waMeNumber(s) {
  let digits = waDigits(s);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `970${digits.slice(1)}`;
  return digits;
}

function FooterLink({ href, children, external = false }) {
  const className =
    'inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out) hover:text-primary';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Footer({ compact = false }) {
  const { camp } = useCamp() || {};
  const { familyUser, adminUser } = useAuth();
  const campName = camp?.name || '';
  const base = camp?.slug ? `/${camp.slug}` : '';
  const year = new Date().getFullYear();
  const supportHref = `https://wa.me/${waMeNumber(SUPPORT_WA)}`;
  const showAllCamps = isGlobalSuperAdmin(adminUser);

  if (compact) {
    return (
      <footer className="mt-auto shrink-0 border-t border-black/8 bg-white" dir="rtl">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} تَكافل</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href={supportHref} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              واتساب
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-primary" dir="ltr">
              {SUPPORT_EMAIL}
            </a>
            <Link href="/super-admin/login" className="hover:text-primary">
              الإدارة العليا
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  const navLinks = camp?.slug
    ? [
        { href: base, label: 'صفحة المخيم' },
        { href: `${base}/news`, label: 'أخبار المخيم' },
        familyUser
          ? { href: `${base}/family/dashboard`, label: 'حسابي' }
          : { href: `${base}/login`, label: 'دخول العائلات' },
        ...(showAllCamps ? [{ href: '/', label: 'كل المخيمات' }] : []),
      ]
    : [
        { href: '/#register', label: 'طلب تسجيل مخيم' },
        ...(showAllCamps ? [{ href: '/', label: 'كل المخيمات' }] : []),
      ];

  return (
    <footer className="mt-auto shrink-0 border-t border-black/8 bg-white" dir="rtl">

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-block">
            <CampLogo height={40} width={140} className="max-h-10 max-w-[9rem] object-contain" />
          </Link>
          <p className="mt-3 text-sm font-semibold text-foreground">{campName || 'تَكافل'}</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
            سجل العائلات وتوزيع الطرود بين اللجنة والأسر، بكرامة وشفافية.
          </p>
        </div>

        {navLinks.length ? (
        <nav aria-label="روابط الفوتر">
          <p className="text-[length:var(--text-caption)] tracking-[0.14em] text-muted-foreground">روابط</p>
          <ul className="mt-2 flex flex-col">
            {navLinks.map((item) => (
              <li key={item.href}>
                <FooterLink href={item.href}>{item.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
        ) : null}

        <div>
          <p className="text-[length:var(--text-caption)] tracking-[0.14em] text-muted-foreground">تواصل</p>
          <ul className="mt-2 flex flex-col">
            <li>
              <a
                href={supportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out) hover:text-primary"
              >
                <IconWhatsApp className="h-4 w-4 text-[#128C7E]" />
                <span>
                  واتساب{' '}
                  <span dir="ltr" className="tabular-nums">
                    {SUPPORT_WA}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors duration-(--duration-ui) ease-(--ease-out) hover:text-primary"
              >
                <IconMail className="h-4 w-4 text-primary" />
                <span dir="ltr">{SUPPORT_EMAIL}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/8 bg-[#F0F2F5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} تَكافل — جميع الحقوق محفوظة</p>
          <p>{camp?.slug ? campName : 'منصة سجل المخيمات والمساعدات'}</p>
        </div>
      </div>
    </footer>
  );
}
