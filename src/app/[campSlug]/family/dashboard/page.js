'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import FamilyShell from '@/components/layout/FamilyShell';
import LogoutButton from '@/components/ui/LogoutButton';
import EmptyState, { PageSpinner } from '@/components/ui/EmptyState';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyFeed } from '@/context/FamilyFeedContext';
import { familyFieldDisplay, genderLabel } from '@/lib/memberOptions';
import InstantNotificationsCard from '@/components/family/InstantNotificationsCard';
import { IconBell, IconClipboard, IconPackage } from '@/components/ui/Icons';

const FAMILY_FIELD_LABELS = {
  head_name: 'اسم رب الأسرة',
  head_gender: 'جنس رب الأسرة',
  national_id: 'رقم هوية رب الأسرة',
  phone: 'الهاتف',
  social_status: 'الحالة الاجتماعية',
  financial_status: 'الوضع المالي',
  spouse_name: 'اسم الزوج/الزوجة',
  spouse_national_id: 'هوية الزوج/الزوجة',
  total_members: 'عدد أفراد الأسرة',
  file_status: 'حالة الملف',
  original_governorate: 'المحافظة الأصلية',
  original_neighborhood: 'الحي الأصلي',
  login_serial: 'رقم الدخول',
};

const FAMILY_FIELD_ORDER = [
  'head_name',
  'head_gender',
  'national_id',
  'phone',
  'social_status',
  'financial_status',
  'spouse_name',
  'spouse_national_id',
  'total_members',
  'file_status',
  'original_governorate',
  'original_neighborhood',
  'login_serial',
];

function initials(name) {
  const s = String(name || '').trim();
  if (!s) return 'أ';
  return s.slice(0, 1);
}

export default function FamilyDashboardPage() {
  const { campSlug } = useParams();
  const { camp } = useCamp() || {};
  const { familyUser, logoutFamily } = useAuth();
  const sub = familyUser?.subscription;
  const inGrace = Boolean(sub?.in_grace);
  const monthlyAmount = sub?.monthly_amount_ils ?? 50;
  const { family, distributions, announcements, loading, unreadCount } = useFamilyFeed();

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

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-l from-[#1877F2] to-primary sm:h-40 md:h-48" />
        <div className="px-3 pb-4 sm:px-4">
          <div className="-mt-10 sm:-mt-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary text-3xl font-bold text-white shadow-sm sm:h-24 sm:w-24 sm:text-4xl md:h-28 md:w-28">
              {initials(greetingName)}
            </div>
            <div className="mt-3 min-w-0">
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
            </div>
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
            {FAMILY_FIELD_ORDER.map((key) => (
              <div key={key} className="flex justify-between gap-3 border-b border-black/6 pb-2 last:border-0 last:pb-0">
                <dt className="text-[#65676B]">{FAMILY_FIELD_LABELS[key]}</dt>
                <dd
                  className={
                    key.includes('id') || key === 'phone' || key === 'login_serial'
                      ? 'font-mono tabular-nums font-medium'
                      : 'font-medium'
                  }
                >
                  {familyFieldDisplay(key, family?.[key])}
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

      <InstantNotificationsCard />

      <div className="mt-4 lg:hidden">
        <LogoutButton
          className="w-full rounded-xl"
          onLogout={() => logoutFamily(`/${campSlug}/login`)}
        />
      </div>
    </FamilyShell>
  );
}
