'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import FamilyShell from '@/components/layout/FamilyShell';
import EmptyState, { PageSpinner } from '@/components/ui/EmptyState';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyFeed } from '@/context/FamilyFeedContext';
import { familyFieldDisplay, genderLabel } from '@/lib/memberOptions';
import { familyFieldValue } from '@/lib/familyFormSchema';
import InstantNotificationsCard from '@/components/family/InstantNotificationsCard';
import VideoGuideButton from '@/components/guide/VideoGuideButton';
import { IconBell, IconClipboard, IconPackage, IconInfo } from '@/components/ui/Icons';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { familyGuideHref, familyGuideSections } from '@/components/guide/familyGuide';

const LOGIN_FIELD = { key: 'login_serial', label: 'رقم الدخول' };

function initials(name) {
  const s = String(name || '').trim();
  if (!s) return 'أ';
  return s.slice(0, 1);
}

export default function FamilyDashboardPage() {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const { familyUser } = useAuth();
  const sub = familyUser?.subscription;
  const inGrace = Boolean(sub?.in_grace);
  const monthlyAmount = sub?.monthly_amount_ils ?? 50;
  const { family, formSchema, distributions, announcements, loading, unreadCount } = useFamilyFeed();

  if (loading) {
    return (
      <FamilyShell title="ملفي" subtitle={camp?.name} maxWidth="max-w-3xl">
        <PageSpinner label="جاري تحميل البيانات" />
      </FamilyShell>
    );
  }

  const greetingName = familyUser?.name || family?.head_name || 'رب الأسرة';
  const members = Array.isArray(family?.members) ? family.members : [];
  const pending = (distributions || []).filter((d) => d.status === 'pending');
  const received = (distributions || []).filter((d) => d.status === 'received');
  const aboutFields = [
    ...(Array.isArray(formSchema) && formSchema.length
      ? formSchema.filter((f) => f.enabled)
      : [
          { key: 'head_name', label: 'اسم رب الأسرة' },
          { key: 'national_id', label: 'رقم هوية رب الأسرة' },
        ]),
    LOGIN_FIELD,
  ];

  return (
    <FamilyShell title={greetingName} subtitle={camp?.name} maxWidth="max-w-3xl">
      {inGrace ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          اشتراك المخيم منتهٍ — فترة سماح. سداد {monthlyAmount} شيكل شهرياً للتجديد عبر إدارة المخيم.
          {sub?.notice_image_url ? (
            <div className="mt-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sub.notice_image_url}
                alt="إشعار الدفع"
                className="max-h-72 w-auto max-w-full object-contain"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <PageGuidePanel
        sections={familyGuideSections(campSlug ? `/${campSlug}` : '')}
        sectionId="profile"
        guideHref={familyGuideHref(campSlug ? `/${campSlug}` : '')}
      />

      <section className="rounded-xl bg-white shadow-sm">
        <div className="relative">
          <div className="h-28 rounded-t-xl bg-gradient-to-l from-[#1877F2] to-primary sm:h-36" />
          <div className="absolute bottom-0 start-4 translate-y-1/2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary text-3xl font-bold text-white shadow-sm sm:h-24 sm:w-24 sm:text-4xl">
              {initials(greetingName)}
            </div>
          </div>
        </div>
        <div className="px-3 pb-4 pt-14 sm:px-4 sm:pt-16">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold leading-snug text-foreground sm:text-2xl">
              {greetingName}
            </h1>
            <p className="mt-0.5 break-words text-sm text-[#65676B]">{camp?.name || 'الأسرة'}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={`/${campSlug}/family/change-request`}
                className={`inline-flex min-h-10 items-center justify-center rounded-lg bg-[#E4E6EB] px-2 text-center text-sm font-semibold text-foreground sm:px-3 ${
                  inGrace ? 'pointer-events-none opacity-50' : 'hover:bg-[#d8dadf]'
                }`}
              >
                تعديل الملف
              </Link>
              <Link
                href={`/${campSlug}/family/change-requests`}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#E4E6EB] px-2 text-center text-sm font-semibold text-foreground hover:bg-[#d8dadf] sm:px-3"
              >
                <IconClipboard className="h-4 w-4 shrink-0" />
                الطلبات
              </Link>
              <Link
                href={`/${campSlug}/contact`}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#E4E6EB] px-2 text-center text-sm font-semibold text-foreground hover:bg-[#d8dadf] sm:px-3"
              >
                تواصل مع إدارة المنصة
              </Link>
              <Link
                href={`/${campSlug}/family/guide`}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#E4E6EB] px-2 text-center text-sm font-semibold text-foreground hover:bg-[#d8dadf] sm:px-3"
              >
                <IconInfo className="h-4 w-4 shrink-0" />
                دليل الاستخدام
              </Link>
            </div>
        </div>
      </section>

      {pending.length > 0 ? (
        <Link
          href={`/${campSlug}/family/notifications`}
          className="mt-4 flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-primary/20 hover:bg-primary/5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <IconPackage className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-foreground">طرد بانتظارك</p>
            <p className="mt-0.5 text-sm text-[#65676B]">
              {pending.length === 1
                ? `لديك «${pending[0].package_type?.name || pending[0].package_label || 'طرد مساعدات'}» بانتظار الاستلام.`
                : `لديك ${pending.length} طرود بانتظار الاستلام من لجنة المخيم.`}
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">عرض الإشعارات</p>
          </div>
        </Link>
      ) : null}

      <VideoGuideButton
        videoId="notifications"
        className="mb-3"
      />
      <InstantNotificationsCard
        title="إشعارات العائلة"
        description="الإشعار بيوصل من تطبيق ntfy: طرد جديد، إلغاء طرد، ونتيجة طلب تعديل بياناتك."
      />

      {unreadCount > 0 && pending.length === 0 ? (
        <Link
          href={`/${campSlug}/family/notifications`}
          className="mt-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:bg-black/4"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <IconBell className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-foreground">لديك إشعارات جديدة</p>
            <p className="text-sm text-[#65676B]">{unreadCount} تنبيه بانتظارك</p>
          </div>
        </Link>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">حول</h2>
          <dl className="space-y-2.5 text-sm">
            {aboutFields.map((field) => (
              <div key={field.key} className="flex justify-between gap-3 border-b border-black/6 pb-2 last:border-0 last:pb-0">
                <dt className="text-[#65676B]">{field.label}</dt>
                <dd
                  className={
                    field.key.includes('id') || field.key === 'phone' || field.key === 'login_serial'
                      ? 'font-mono tabular-nums font-medium'
                      : 'font-medium'
                  }
                >
                  {familyFieldDisplay(field.key, familyFieldValue(family, field.key))}
                </dd>
              </div>
            ))}
          </dl>
          {received.length > 0 ? (
            <p className="mt-4 text-xs text-[#65676B]">
              آخر تسليم: {received[0].package_type?.name || received[0].package_label || 'طرد'} — يظهر في الإشعارات.
            </p>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">أفراد الأسرة</h2>
              <span className="text-sm text-[#65676B]">{members.length}</span>
            </div>
            {members.length > 0 ? (
              <ul className="grid grid-cols-2 gap-2">
                {members.map((m) => (
                  <li key={m.id} className="rounded-lg bg-[#F0F2F5] p-3">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {initials(m.name)}
                    </div>
                    <p className="truncate text-sm font-semibold">{m.name || 'بدون اسم'}</p>
                    <p className="truncate text-xs text-[#65676B]">
                      {m.relationship || 'غير محدد'}
                      {m.gender ? ` · ${genderLabel(m.gender)}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState description="لا يوجد أفراد مسجلون لهذه الأسرة." />
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">آخر الأخبار</h2>
              <Link href={`/${campSlug}/news`} className="text-sm font-semibold text-primary hover:underline">
                عرض الكل
              </Link>
            </div>
            {announcements.length > 0 ? (
              <ul className="space-y-2">
                {announcements.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    <Link href={`/${campSlug}/news#post-${a.id}`} className="block rounded-lg p-2 hover:bg-[#F0F2F5]">
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-[#65676B]">{a.content}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#65676B]">لا توجد أخبار جديدة.</p>
            )}
          </section>
        </div>
      </div>
    </FamilyShell>
  );
}
