'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCamp } from '@/context/CampContext';

const icons = {
  about: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  support: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  justice: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
      />
    </svg>
  ),
  news: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  ),
};

export default function HomePillarsStrip() {
  const { camp } = useCamp() || {};
  const base = camp?.slug ? `/${camp.slug}` : '';
  const hashBase = base || '/';

  const pillars = useMemo(
    () => [
      {
        key: 'about',
        href: `${hashBase}#about`,
        title: 'تنظيم البيانات',
        desc: 'سجل عائلي واضح وفلترة دقيقة للمساعدات.',
        icon: icons.about,
      },
      {
        key: 'support',
        href: `${hashBase}#support`,
        title: 'التواصل',
        desc: 'رسائل بين العائلات والجنة بسهولة وخصوصية.',
        icon: icons.support,
      },
      {
        key: 'justice',
        href: `${hashBase}#justice`,
        title: 'عدالة التوزيع',
        desc: 'معايير موحّدة وشفافية في تسليم الطرود.',
        icon: icons.justice,
      },
      {
        key: 'news',
        href: base ? `${base}/news` : '/news',
        title: 'أخبار المخيم',
        desc: 'آخر التحديثات والتفاعل مع المنشورات.',
        icon: icons.news,
      },
    ],
    [base, hashBase]
  );

  return (
    <section aria-label="محاور المنصة" dir="rtl">
      <div className="divide-y divide-border border border-border bg-card">
        {pillars.map((p) => (
          <Link
            key={p.key}
            href={p.href}
            className="file-spine flex items-start gap-3 px-4 py-4 transition-colors duration-(--duration-ui) ease-(--ease-out) hover:bg-muted/50"
          >
            <span className="mt-0.5 text-primary">{p.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
