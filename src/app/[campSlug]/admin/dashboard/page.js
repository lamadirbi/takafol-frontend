'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { formatDate, getApiErrorMessage, unwrapPaginated } from '@/lib/utils';
import Button from '@/components/ui/Button';

const PAYMENT_METHODS = [
  {
    method: 'محفظة بال باي',
    number: '0592533678',
    name: 'لما أحمد الدربي',
  },
  {
    method: 'بنك فلسطين',
    number: '0592377078',
    name: 'اسماعيل أسامة عبد العال',
  },
];

async function sumMembersAcrossPages() {
  let page = 1;
  let sum = 0;
  let totalFamilies = 0;
  const perPage = 200;
  let hasMore = true;
  while (hasMore) {
    const res = await api.get('/admin/families', { params: { per_page: perPage, page } });
    const { items, total } = unwrapPaginated(res);
    totalFamilies = total;
    sum += items.reduce((acc, f) => acc + (Number(f.total_members) || 0), 0);
    hasMore = items.length > 0 && page * perPage < total;
    page += 1;
  }
  return { families: totalFamilies, members: sum };
}

export default function AdminDashboardPage() {
  const { campSlug } = useParams();
  const [stats, setStats] = useState({ families: 0, members: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);
  const { camp, refreshCamp } = useCamp();
  const [renewalUploading, setRenewalUploading] = useState(false);
  const [renewalHistory, setRenewalHistory] = useState([]);
  const [renewalHistoryLoading, setRenewalHistoryLoading] = useState(false);
  const [renewalHistoryError, setRenewalHistoryError] = useState('');
  const base = campSlug ? `/${campSlug}` : '';

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, memberAgg] = await Promise.all([
        api.get('/announcements', { params: { per_page: 1 } }),
        sumMembersAcrossPages(),
      ]);
      const annMeta = annRes.data?.meta;
      const annTotal =
        typeof annMeta?.total === 'number' ? annMeta.total : unwrapPaginated(annRes).total;

      setStats({
        families: memberAgg.families,
        members: memberAgg.members,
        announcements: annTotal,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchRenewalHistory = useCallback(async () => {
    setRenewalHistoryLoading(true);
    setRenewalHistoryError('');
    try {
      const res = await api.get('/admin/camp/subscription-renewal-requests', {
        params: { per_page: 10 },
      });
      const { items } = unwrapPaginated(res);
      setRenewalHistory(items);
    } catch (err) {
      setRenewalHistory([]);
      setRenewalHistoryError(getApiErrorMessage(err, 'تعذر جلب سجل إشعارات الدفع.'));
    } finally {
      setRenewalHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRenewalHistory();
  }, [fetchRenewalHistory]);

  const sub = camp?.subscription;
  const monthlyAmount = sub?.monthly_amount_ils ?? 15;

  async function handleSubscriptionNoticeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRenewalUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post('/admin/camp/subscription-renewal-requests', fd);
      await fetchRenewalHistory();
      await refreshCamp?.();
    } catch (err) {
      alert(getApiErrorMessage(err, 'تعذر إرسال إشعار الدفع.'));
    } finally {
      setRenewalUploading(false);
      e.target.value = '';
    }
  }

  const statCards = [
    { label: 'إجمالي العائلات', value: stats.families, icon: '👨‍👩‍👧', color: 'bg-blue-50 text-blue-600' },
    { label: 'إجمالي الأفراد (حسب العدد المسجّل)', value: stats.members, icon: '👥', color: 'bg-green-50 text-green-600' },
    { label: 'الإعلانات', value: stats.announcements, icon: '📢', color: 'bg-amber-50 text-amber-600' },
  ];

  const quickLinks = [
    { href: `${base}/admin/families`, label: 'سجل العائلات', icon: '➕', desc: 'إضافة، تعديل، استيراد Excel' },
    { href: `${base}/admin/filter`, label: 'فلترة المخيم', icon: '🔍', desc: 'عائلات أو أفراد وحفظ السجلات' },
    { href: `${base}/admin/change-requests`, label: 'طلبات تعديل البيانات', icon: '📝', desc: 'مراجعة طلبات العائلات وقبولها أو رفضها' },
    { href: `${base}/news`, label: 'أخبار المخيم', icon: '✉️', desc: 'نشر إعلان أو متابعة التفاعل' },
    { href: `${base}/admin/camp-records`, label: 'سجلات الفلترة', icon: '📂', desc: 'السجلات المحفوظة والطرود' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="الرئيسية" subtitle={camp?.name} />
        <AdminMobileNav />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
          <h1 className="mb-6 text-3xl font-bold text-slate-900">أهلاً بك في نظام الإدارة</h1>

          {sub ? (
            <section className="mb-8 rounded-3xl border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-white to-amber-50/40 p-6 shadow-md md:p-8">
              <h2 className="text-xl font-bold text-slate-900">اشتراك المنصّة والعائلات</h2>
              <p className="mt-2 text-sm text-slate-700">
                الاشتراك الشهري تكلفته <strong className="text-primary">{monthlyAmount} شيكل</strong>، ويتم عرض عداد لعدد
                الأيام المتبقية في الاشتراك. عند انتهاء الاشتراك بدون تجديد تُحجَب مميزات الموقع عن العائلات. لتجديد
                الاشتراك أرسل إشعار الدفع عبر الزر المخصص بالأسفل، وسيتم تجديد اشتراكك خلال 24 ساعة.
              </p>

              {sub.status === 'unlimited' ? (
                <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
                  {sub.message ||
                    'لم يُضبط تاريخ انتهاء اشتراك لهذا المخيم بعد؛ لن يُطبَّق حظر على العائلات حتى يُحدَّد تاريخ من إدارة المنصة.'}
                </p>
              ) : null}

              {sub.status === 'active' ? (
                <div className="mt-6 flex flex-wrap items-stretch gap-4">
                  <div className="min-w-[10rem] flex-1 rounded-2xl bg-white px-6 py-5 text-center shadow-sm ring-1 ring-primary/15">
                    <p className="text-xs font-semibold text-slate-500">متبقي للاشتراك</p>
                    <p className="mt-1 text-5xl font-black tabular-nums text-primary">{sub.days_until_expiry}</p>
                    <p className="mt-1 text-sm text-slate-600">يوماً (حتى {sub.valid_until})</p>
                  </div>
                </div>
              ) : null}

              {sub.status === 'grace' ? (
                <div className="mt-6 flex flex-wrap items-stretch gap-4">
                  <div className="min-w-[10rem] flex-1 rounded-2xl bg-amber-100 px-6 py-5 text-center shadow-sm ring-2 ring-amber-300">
                    <p className="text-xs font-bold text-amber-900">متبقي قبل إيقاف العائلات</p>
                    <p className="mt-1 text-5xl font-black tabular-nums text-amber-950">
                      {sub.days_until_hard_lock}
                    </p>
                    <p className="mt-1 text-sm text-amber-900/90">يوماً حتى {sub.hard_lock_at}</p>
                  </div>
                  <div className="min-w-[12rem] flex-1 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-950">
                    <p className="font-bold">فترة سماح — المميزات معطّلة للعائلات</p>
                    <p className="mt-1 text-xs">{sub.message}</p>
                  </div>
                </div>
              ) : null}

              {sub.status === 'locked' ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
                  <p className="font-bold">اشتراك منتهٍ وفترة السماح انتهت</p>
                  <p className="mt-1">{sub.message}</p>
                </div>
              ) : null}

              <div className="mt-8 border-t border-slate-200/80 pt-6">
                <h3 className="text-sm font-bold text-slate-900">وسائل الدفع</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {PAYMENT_METHODS.map((item) => (
                    <div key={item.method} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                      <p className="font-bold text-slate-900">{item.method}</p>
                      <p className="mt-1 text-slate-700" dir="ltr">
                        {item.number}
                      </p>
                      <p className="mt-1 text-slate-600">الاسم: {item.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200/80 pt-6">
                <h3 className="text-sm font-bold text-slate-900">إرسال إشعار الدفع للإدارة العامة</h3>
                <p className="mt-1 text-xs text-slate-600">
                  ارفع صورة إشعار التحويل. سيصل الطلب مباشرة إلى إدارة المنصة مع اسم المخيم وتاريخ الإرسال.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    {renewalUploading ? 'جاري الإرسال…' : 'إرسال إشعار الدفع'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={renewalUploading}
                      onChange={handleSubscriptionNoticeUpload}
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-900">سجل إشعارات الدفع المرسلة</h4>
                  {renewalHistoryLoading ? (
                    <p className="mt-2 text-xs text-slate-500">جاري تحميل السجل…</p>
                  ) : renewalHistoryError ? (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                      {renewalHistoryError}
                    </p>
                  ) : renewalHistory.length ? (
                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <ul className="divide-y divide-slate-100">
                        {renewalHistory.map((row) => (
                          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                            <div>
                              <p className="font-semibold text-slate-900">{formatDate(row.created_at)}</p>
                              <p className="text-slate-600">
                                الحالة:{' '}
                                {row.status === 'pending'
                                  ? 'قيد المراجعة'
                                  : row.status === 'approved'
                                    ? 'مقبول'
                                    : 'مرفوض'}
                              </p>
                            </div>
                            {row.image_url ? (
                              <a
                                href={row.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-primary underline"
                              >
                                عرض الإشعار
                              </a>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">لا يوجد إشعارات مرسلة بعد.</p>
                  )}
                </div>

              </div>
            </section>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, i) => (
              <Card key={i} className="flex items-center gap-6 rounded-3xl border-none p-6 shadow-sm">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {loading ? '…' : stat.value}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">روابط سريعة</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickLinks.map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="flex flex-col rounded-2xl border border-slate-200 p-5 text-center transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <span className="mb-2 text-2xl">{q.icon}</span>
                    <span className="font-bold text-slate-800">{q.label}</span>
                    <span className="mt-1 text-xs text-slate-500">{q.desc}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">حالة النظام</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                  <span className="text-slate-600">اتصال قاعدة البيانات</span>
                  <span className="font-bold text-green-600">متصل</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                  <span className="text-slate-600">المخيم الحالي</span>
                  <span className="font-bold text-primary">{camp?.name || '—'}</span>
                </div>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
