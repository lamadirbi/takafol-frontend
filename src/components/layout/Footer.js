'use client';

import Link from 'next/link';
import CampLogo from '@/components/shared/CampLogo';
import { useCamp } from '@/context/CampContext';

export default function Footer() {
  const { camp } = useCamp() || {};
  const campName = camp?.name || 'تَكافل — مخيم طيبة التربوي';
  const base = camp?.slug ? `/${camp.slug}` : '';

  return (
    <footer className="mt-auto shrink-0 border-t border-slate-200/90 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-start gap-3" dir="rtl">
          <CampLogo
            height={80}
            width={240}
            className="max-h-20 max-w-[16rem] object-contain sm:max-h-24"
          />
          <p className="text-base font-bold text-slate-900">{campName}</p>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600">
            منصة موثوقة لتنظيم المساعدات والتواصل بين اللجنة والعائلات.
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600"
          dir="rtl"
        >
          <Link className="transition hover:text-primary" href={`${base || '/'}#about`}>
            تنظيم البيانات
          </Link>
          <Link className="transition hover:text-primary" href={`${base || '/'}#support`}>
            التواصل
          </Link>
          <Link className="transition hover:text-primary" href={`${base || '/'}#justice`}>
            عدالة التوزيع
          </Link>
          <Link className="transition hover:text-primary" href={base ? `${base}/news` : '/news'}>
            أخبار المخيم
          </Link>
          <Link className="text-slate-400 transition hover:text-primary" href={base ? `${base}/login/admin` : '/login/admin'}>
            دخول الإدارة
          </Link>
        </nav>
        <div className="text-left text-sm text-slate-600 md:pt-2">
          <p dir="ltr">radartech85@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
