'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import { FilePanel, LedgerStrip } from '@/components/ui/Card';
import { IconCheck, IconCopy } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { useNotice } from '@/context/NoticeContext';
import { formatDate, getApiErrorMessage, unwrapPaginated } from '@/lib/utils';

const PAYMENT_METHODS = [
  {
    method: 'محفظة بال باي',
    number: '0592533678',
    name: 'لما أحمد الدربي',
  },
];

const SUB_STATUS_LABEL = {
  active: 'نشط',
  grace: 'فترة سماح',
  locked: 'متوقف',
  unlimited: 'بدون حد',
};

const NOTICE_STATUS = {
  pending: { label: 'قيد المراجعة', className: 'text-warn' },
  approved: { label: 'مقبول', className: 'text-secondary' },
  rejected: { label: 'مرفوض', className: 'text-destructive' },
};

function formatDay(value) {
  if (!value) return '—';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { dateStyle: 'long' }).format(date);
}

function CopyNumber({ value }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-border px-2.5 text-xs font-medium hover:bg-muted"
      aria-label={`نسخ ${value}`}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
      {copied ? 'تم النسخ' : 'نسخ'}
    </button>
  );
}

export default function AdminDashboardPage() {
  const { campSlug } = useParams();
  const [stats, setStats] = useState({ families: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const { camp, refreshCamp } = useCamp();
  const showNotice = useNotice();
  const [renewalUploading, setRenewalUploading] = useState(false);
  const [renewalHistory, setRenewalHistory] = useState([]);
  const [renewalHistoryLoading, setRenewalHistoryLoading] = useState(false);
  const [renewalHistoryError, setRenewalHistoryError] = useState('');
  const base = campSlug ? `/${campSlug}` : '';

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/dashboard-stats');
      setStats({
        families: Number(data?.families) || 0,
        members: Number(data?.members) || 0,
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
  const monthlyAmount = sub?.monthly_amount_ils ?? 50;

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
      showNotice(getApiErrorMessage(err, 'تعذر إرسال إشعار الدفع.'));
    } finally {
      setRenewalUploading(false);
      e.target.value = '';
    }
  }

  const subSpine =
    sub?.status === 'locked' ? 'stamp' : sub?.status === 'grace' ? 'warn' : 'carbon';

  const quickLinks = [
    { href: `${base}/admin/families`, label: 'سجل العائلات', desc: 'إضافة، تعديل، استيراد Excel' },
    { href: `${base}/admin/filter`, label: 'فلترة المخيم', desc: 'عائلات أو أفراد وحفظ السجلات' },
    { href: `${base}/admin/change-requests`, label: 'طلبات تعديل البيانات', desc: 'مراجعة الطلبات وقبولها أو رفضها' },
    { href: `${base}/admin/camp-records`, label: 'السجلات المحفوظة', desc: 'سجلات الفلترة والطرود المحفوظة' },
    { href: `${base}/news`, label: 'أخبار المخيم', desc: 'نشر إعلان أو متابعة التفاعل' },
  ];

  return (
    <AdminShell title="اليوم" subtitle={camp?.name}>
      {sub && (sub.status === 'grace' || sub.status === 'locked') ? (
        <FilePanel spine={subSpine} className="mb-5">
          <p className="text-sm font-medium text-foreground">
            {sub.status === 'locked' ? 'الاشتراك متوقف — العائلات محجوبة.' : 'فترة سماح: المميزات معطّلة للعائلات.'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{sub.message}</p>
        </FilePanel>
      ) : null}

      <LedgerStrip
        className="mb-5"
        items={[
          { label: 'العائلات', value: loading ? '…' : stats.families },
          { label: 'الأفراد', value: loading ? '…' : stats.members, hint: 'حسب العدد المسجّل' },
        ]}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-[length:var(--text-caption)] font-medium tracking-[0.16em] text-muted-foreground">
          ابدأ من هنا
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="rounded-xl bg-white px-4 py-4 shadow-sm transition-colors hover:bg-[#F0F2F5]"
            >
              <span className="block font-semibold text-foreground">{q.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{q.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {sub ? (
        <details className="overflow-hidden border border-border bg-card open:bg-card">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
            <span>اشتراك المنصة · {monthlyAmount} شيكل / شهر</span>
            {sub.status === 'active' ? (
              <span className="tabular-nums text-muted-foreground">{sub.days_until_expiry} يوماً متبقياً</span>
            ) : sub.status === 'unlimited' ? (
              <span className="text-muted-foreground">بدون حد</span>
            ) : (
              <span className="text-warn">يحتاج تجديداً</span>
            )}
          </summary>

          <div className="border-t border-border">
            <dl className="grid sm:grid-cols-3">
              <div className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-e">
                <dt className="text-[length:var(--text-caption)] font-medium tracking-[0.12em] text-muted-foreground">
                  الحالة
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {SUB_STATUS_LABEL[sub.status] || sub.status}
                </dd>
              </div>
              <div className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-e">
                <dt className="text-[length:var(--text-caption)] font-medium tracking-[0.12em] text-muted-foreground">
                  صالح حتى
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {sub.status === 'unlimited' ? 'غير محدد' : formatDay(sub.valid_until)}
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className="text-[length:var(--text-caption)] font-medium tracking-[0.12em] text-muted-foreground">
                  المبلغ الشهري
                </dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                  {monthlyAmount} شيكل
                </dd>
              </div>
            </dl>

            {sub.status === 'unlimited' ? (
              <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                {sub.message ||
                  'لم يُضبط تاريخ انتهاء اشتراك لهذا المخيم بعد؛ لن يُطبَّق حظر على العائلات حتى يُحدَّد تاريخ من إدارة المنصة.'}
              </p>
            ) : null}

            <section className="border-t border-border px-4 py-4">
              <h3 className="text-sm font-semibold text-foreground">1. حوّل الاشتراك</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                اختر طريقة واحدة، ثم انسخ الرقم وحوّل {monthlyAmount} شيكل.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {PAYMENT_METHODS.map((item) => (
                  <div key={item.method} className="border border-border bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.method}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[length:var(--text-caption)] text-muted-foreground">الرقم</p>
                        <p className="mt-0.5 font-medium tabular-nums text-foreground" dir="ltr">
                          {item.number}
                        </p>
                      </div>
                      <CopyNumber value={item.number} />
                    </div>
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-[length:var(--text-caption)] text-muted-foreground">اسم المستفيد</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-border px-4 py-4">
              <h3 className="text-sm font-semibold text-foreground">2. أرسل صورة التحويل</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                ارفع صورة الإشعار ليصل الطلب لإدارة المنصة. لا يُجدَّد الاشتراك تلقائياً قبل المراجعة.
              </p>
              <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-control)] border border-border bg-card px-4 text-sm font-medium hover:bg-muted">
                {renewalUploading ? 'جاري الإرسال…' : 'رفع صورة التحويل'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={renewalUploading}
                  onChange={handleSubscriptionNoticeUpload}
                />
              </label>
            </section>

            <section className="border-t border-border px-4 py-4">
              <h3 className="text-[length:var(--text-caption)] font-medium tracking-[0.12em] text-muted-foreground">
                سجل الإشعارات
              </h3>
              {renewalHistoryLoading ? (
                <p className="mt-2 text-xs text-muted-foreground">جاري تحميل السجل…</p>
              ) : renewalHistoryError ? (
                <p className="mt-2 border border-destructive/30 bg-(--stamp-fill) px-3 py-2 text-xs text-destructive">
                  {renewalHistoryError}
                </p>
              ) : renewalHistory.length ? (
                <ul className="mt-2 divide-y divide-border border border-border">
                  {renewalHistory.map((row) => {
                    const notice = NOTICE_STATUS[row.status] || NOTICE_STATUS.pending;
                    return (
                      <li key={row.id} className="px-3 py-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">{formatDate(row.created_at)}</p>
                            <p className={notice.className}>{notice.label}</p>
                          </div>
                        </div>
                        <div className="mt-2 overflow-hidden rounded-lg bg-[#F0F2F5]">
                          {row.image_url ? (
                            <a href={row.image_url} target="_blank" rel="noreferrer" className="block">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={row.image_url}
                                alt="إشعار التحويل"
                                className="mx-auto max-h-56 w-full object-contain"
                              />
                            </a>
                          ) : (
                            <p className="px-3 py-8 text-center text-[#65676B]">لا توجد صورة مرفقة</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">لا يوجد إشعارات مرسلة بعد.</p>
              )}
            </section>
          </div>
        </details>
      ) : null}
    </AdminShell>
  );
}
