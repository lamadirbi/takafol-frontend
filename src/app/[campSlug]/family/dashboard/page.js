'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, unwrapApiList, unwrapResource, unwrapResourceArray } from '@/lib/utils';
import {
  pushSupported,
  getPushPermission,
  enablePush,
  disablePush,
  getCurrentSubscription,
} from '@/lib/push';

function distLabel(d) {
  const st = d?.status;
  if (st === 'received') return 'تم الاستلام';
  if (st === 'pending') return 'قيد الانتظار';
  if (st === 'not_eligible') return 'غير مستحق';
  return st || '—';
}

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

export default function FamilyDashboardPage() {
  const router = useRouter();
  const { campSlug } = useParams();
  const { camp } = useCamp();
  const { user, logout } = useAuth();
  const sub = user?.subscription;
  const inGrace = Boolean(sub?.in_grace);
  const monthlyAmount = sub?.monthly_amount_ils ?? 15;

  const [family, setFamily] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushState, setPushState] = useState('idle');
  const [pushEnabled, setPushEnabled] = useState(false);

  const refreshPush = useCallback(async () => {
    if (!pushSupported()) {
      setPushEnabled(false);
      return;
    }
    const perm = await getPushPermission();
    const sub = await getCurrentSubscription();
    setPushEnabled(perm === 'granted' && !!sub);
  }, []);

  useEffect(() => {
    refreshPush();
  }, [refreshPush]);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, newsRes] = await Promise.all([
          api.get('/family/dashboard'),
          api.get('/announcements', { params: { per_page: 8 } }).catch(() => ({ data: {} })),
        ]);
        const d = dashRes.data;
        setFamily(unwrapResource(d.family));
        setDistributions(unwrapResourceArray(d.current_distributions));
        setAnnouncements(unwrapApiList(newsRes));
      } catch {
        setFamily(null);
        setDistributions([]);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePushToggle = async () => {
    setPushState('loading');
    try {
      if (pushEnabled) {
        await disablePush();
      } else {
        await enablePush();
      }
      await refreshPush();
    } catch (e) {
      console.error(e);
    } finally {
      setPushState('idle');
    }
  };

  const handleLogout = async () => {
    await logout(`/${campSlug}/login`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const greetingName = user?.name || family?.head_name || 'رب الأسرة';
  const members = Array.isArray(family?.members) ? family.members : [];

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header title="لوحة رب الأسرة" subtitle={camp?.name} />

      <div className="border-b border-slate-200 bg-white px-4 py-3" dir="rtl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            مرحباً <span className="font-bold text-slate-900">{greetingName}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${campSlug}`}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              الرئيسية
            </Link>
            <Link
              href={`/${campSlug}/news`}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              أخبار المخيم
            </Link>
            <Link
              href={`/${campSlug}/family/change-requests`}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              طلبات التعديل
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              خروج
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:py-12" dir="rtl">
        <div className="mb-8 rounded-4xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-slate-900">لوحة رب الأسرة</h1>
          <p className="mt-1 text-slate-500">متابعة الطرود والبيانات المسجّلة.</p>
        </div>

        {inGrace ? (
          <div className="mb-8 overflow-hidden rounded-3xl border-2 border-amber-300 bg-amber-50 shadow-sm" dir="rtl">
            <div className="border-b border-amber-200 bg-amber-100/80 px-4 py-3">
              <p className="text-center text-sm font-bold text-amber-950">
                اشتراك المخيم في المنصة منتهٍ — فترة سماح: يرجى سداد {monthlyAmount} شيكل شهرياً للتجديد. بعض الميزات
                معطّلة حتى يُحدَّث الاشتراك من إدارة المخيم.
              </p>
            </div>
            {sub?.notice_image_url ? (
              <div className="relative flex justify-center bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sub.notice_image_url}
                  alt="إشعار الدفع"
                  className="max-h-72 w-auto max-w-full object-contain"
                />
              </div>
            ) : (
              <p className="px-4 py-4 text-center text-sm text-amber-900">
                ستظهر هنا صورة إشعار الدفع عندما ترفعها إدارة المخيم.
              </p>
            )}
          </div>
        ) : null}

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm opacity-100">
          <h2 className="text-lg font-bold text-slate-900">إشعارات الهاتف</h2>
          <p className="mt-2 text-sm text-slate-600">
            فعّل إشعارات المتصفح لتصلك عند نشر خبر جديد أو عند وجود طرد بانتظار الاستلام.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {pushSupported() ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant={pushEnabled ? 'outline' : 'primary'}
                  disabled={pushState === 'loading' || inGrace}
                  onClick={handlePushToggle}
                >
                  {pushState === 'loading'
                    ? '…'
                    : pushEnabled
                      ? 'إلغاء الإشعارات'
                      : 'تفعيل الإشعارات'}
                </Button>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    pushEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {pushEnabled ? 'مفعّلة' : 'غير مفعّلة'}
                </span>
              </>
            ) : (
              <p className="text-sm text-slate-500">المتصفح لا يدعم إشعارات الدفع على هذا الجهاز.</p>
            )}
            {inGrace ? (
              <p className="mt-3 text-xs font-medium text-amber-800">
                تفعيل الإشعارات غير متاح خلال فترة السماح حتى يُجدَّد الاشتراك.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <span>📦</span> الطرود
              </h2>
              {distributions.length > 0 ? (
                <div className="space-y-4">
                  {distributions.map((d) => (
                    <Card
                      key={d.id}
                      className="flex flex-col gap-3 rounded-2xl border-none bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {d.package_type?.name || d.package_label || 'طرد مساعدات'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          بتاريخ: {formatDate(d.created_at)}
                          {d.camp_filter_record?.name ? ` — ${d.camp_filter_record.name}` : ''}
                        </p>
                      </div>
                      <Badge variant={d.status === 'received' ? 'primary' : 'secondary'}>
                        {distLabel(d)}
                      </Badge>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-slate-500">لا يوجد طرد قيد الانتظار حالياً.</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <span>📢</span> تنبيهات هامة
              </h2>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <Card key={a.id} className="rounded-2xl border-none bg-white p-5 shadow-sm">
                      <h3 className="font-bold text-slate-900">{a.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.content}</p>
                      <p className="mt-3 text-[10px] text-slate-400">{formatDate(a.published_at || a.created_at)}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-slate-500">لا توجد تنبيهات جديدة.</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <span>👨‍👩‍👧‍👦</span> أفراد الأسرة
              </h2>
              {members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((m) => (
                    <Card key={m.id} className="rounded-2xl border-none bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-slate-900">{m.name || 'بدون اسم'}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {m.relationship || 'غير محدد'}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                        <p>الهوية: <span className="font-mono">{m.national_id || '—'}</span></p>
                        <p>تاريخ الميلاد: <span>{m.date_of_birth || '—'}</span></p>
                        <p>العمر: <span>{m.age ?? '—'}</span></p>
                        <p>الجنس: <span>{m.gender || '—'}</span></p>
                        <p>الحالة الصحية: <span>{m.health_status || '—'}</span></p>
                        <p>مستوى التعليم: <span>{m.education_level || '—'}</span></p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-slate-500">لا يوجد أفراد مسجلون لهذه الأسرة.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-4xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-slate-900">
                بيانات الأسرة المسجّلة
              </h2>
              <div className="space-y-3 text-sm">
                {FAMILY_FIELD_ORDER.map((key) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-slate-500">{FAMILY_FIELD_LABELS[key]}</span>
                    <span className={key.includes('id') || key === 'phone' || key === 'login_serial' ? 'font-mono font-medium' : 'font-medium'}>
                      {family?.[key] ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section
              className={`rounded-4xl border border-primary/10 bg-primary/5 p-6 ${inGrace ? 'opacity-60' : ''}`}
            >
              <h2 className="mb-2 text-lg font-bold text-primary">طلب تعديل البيانات</h2>
              <p className="mb-4 text-xs text-slate-600">
                تُحفظ طلباتك في سجل حتى تُراجعها الإدارة وتقبلها أو ترفضها.
              </p>
              {inGrace ? (
                <p className="mb-4 rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-950">
                  طلبات التعديل معطّلة خلال فترة السماح — سدّد {monthlyAmount} شيكل للتجديد عبر إدارة المخيم.
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-primary/30 py-3 text-sm font-bold text-primary"
                  onClick={() => router.push(`/${campSlug}/family/change-requests`)}
                >
                  عرض سجل الطلبات
                </Button>
                <Button
                  type="button"
                  className="w-full rounded-xl py-3 text-sm font-bold shadow-sm"
                  disabled={inGrace}
                  onClick={() => router.push(`/${campSlug}/family/change-request`)}
                >
                  إرسال طلب تعديل جديد
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
