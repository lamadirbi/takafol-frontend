'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import FamilyShell from '@/components/layout/FamilyShell';
import { PageSpinner } from '@/components/ui/EmptyState';
import { useCamp } from '@/context/CampContext';
import { useFamilyFeed } from '@/context/FamilyFeedContext';
import { formatRelativeTime } from '@/lib/utils';
import { IconBell, IconMegaphone, IconPackage } from '@/components/ui/Icons';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { familyGuideHref, familyGuideSections } from '@/components/guide/familyGuide';

function kindMeta(kind) {
  if (kind === 'package') {
    return { icon: IconPackage, wrap: 'bg-primary/15 text-primary', accent: 'طرد' };
  }
  if (kind === 'package_received') {
    return { icon: IconPackage, wrap: 'bg-secondary/15 text-secondary', accent: 'تسليم' };
  }
  return { icon: IconMegaphone, wrap: 'bg-[#E4E6EB] text-[#65676B]', accent: 'خبر' };
}

export default function FamilyNotificationsPage() {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const { items, loading, markAllRead, isRead } = useFamilyFeed();
  const [highlight, setHighlight] = useState(() => new Set());
  const marked = useRef(false);

  useEffect(() => {
    if (loading || marked.current) return;
    marked.current = true;
    setHighlight(new Set(items.filter((n) => !isRead(n.id)).map((n) => String(n.id))));
    if (items.length) markAllRead();
  }, [loading, items, isRead, markAllRead]);

  return (
    <FamilyShell title="الإشعارات" subtitle={camp?.name} maxWidth="max-w-[680px]">
      <PageGuidePanel
        sections={familyGuideSections(campSlug ? `/${campSlug}` : '')}
        sectionId="notifications"
        guideHref={familyGuideHref(campSlug ? `/${campSlug}` : '')}
      />
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <header className="flex items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-[22px] font-bold text-foreground">الإشعارات</h1>
          {highlight.size > 0 ? (
            <span className="text-xs font-semibold text-primary">{highlight.size} جديد</span>
          ) : null}
        </header>

        {loading ? (
          <div className="py-10">
            <PageSpinner label="جاري تحميل الإشعارات" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E4E6EB] text-[#65676B]">
              <IconBell className="h-7 w-7" />
            </span>
            <p className="text-base font-semibold text-foreground">لا إشعارات حتى الآن</p>
            <p className="mt-1 text-sm text-[#65676B]">
              تصلك هنا تنبيهات تسليم الطرود وأخبار المخيم.
            </p>
          </div>
        ) : (
          <ul>
            {items.map((n) => {
              const meta = kindMeta(n.kind);
              const Icon = meta.icon;
              const unread = highlight.has(String(n.id));
              return (
                <li key={n.id} className="border-t border-black/6">
                  <Link
                    href={n.href}
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-black/4 ${
                      unread ? 'bg-primary/8' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${meta.wrap}`}
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[15px] leading-snug text-foreground">
                        <span className="font-bold">{n.title}</span>
                        {n.body ? <span className="font-normal"> — {n.body}</span> : null}
                      </p>
                      <p className={`mt-1 text-[13px] ${unread ? 'font-semibold text-primary' : 'text-[#65676B]'}`}>
                        {meta.accent} · {formatRelativeTime(n.created_at) || 'الآن'}
                      </p>
                    </div>
                    {unread ? (
                      <span className="mt-3 h-3 w-3 shrink-0 rounded-full bg-primary" aria-hidden />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {campSlug ? (
        <p className="mt-4 text-center text-sm text-[#65676B]">
          <Link href={`/${campSlug}/news`} className="font-semibold text-primary hover:underline">
            عرض أخبار المخيم
          </Link>
        </p>
      ) : null}
    </FamilyShell>
  );
}
