'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminMobileNav from '@/components/layout/AdminMobileNav';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { formatDate, getApiErrorMessage, unwrapResource, unwrapResourceArray } from '@/lib/utils';

function distLabel(st) {
  if (st === 'received') return 'تم الاستلام';
  if (st === 'pending') return 'قيد الانتظار';
  if (st === 'not_eligible') return 'غير مستحق';
  return st || '—';
}

export default function AdminFamilyPortalViewPage() {
  const { campSlug, familyId } = useParams();
  const base = campSlug ? `/${campSlug}` : '';
  const { camp } = useCamp();

  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/families/${familyId}`);
      setFamily(unwrapResource(res.data));
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحميل بيانات العائلة.'));
      setFamily(null);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  const distributions = unwrapResourceArray(family?.distributions);
  const received = distributions.filter((d) => d.status === 'received');
  const pending = distributions.filter((d) => d.status === 'pending');
  const other = distributions.filter(
    (d) => d.status !== 'received' && d.status !== 'pending'
  );

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="عرض طرود العائلة" subtitle={camp?.name} />
        <AdminMobileNav />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" dir="rtl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`${base}/admin/families`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              ← العودة لسجل العائلات
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : null}

          {error ? <p className="text-red-700">{error}</p> : null}

          {!loading && family ? (
            <>
              <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">{family.head_name || 'عائلة'}</h1>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-slate-500">رقم الهوية: </span>
                    <span className="font-mono font-medium">{family.national_id ?? '—'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">الجوال: </span>
                    {family.phone ?? '—'}
                  </p>
                  <p>
                    <span className="text-slate-500">عدد الأفراد: </span>
                    {family.total_members ?? '—'}
                  </p>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  عرض يقرّب تجربة العائلة: الطرود المستلمة سابقاً والقيد بانتظار الاستلام ضمن هذا المخيم.
                </p>
              </div>

              <section className="mb-8 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-emerald-900">طرود تم استلامها سابقاً</h2>
                {received.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">لا يوجد طرود مسجّلة كمستلمة بعد.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {received.map((d) => (
                      <li
                        key={d.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {d.package_type?.name || d.package_label || 'طرد'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {d.delivered_at ? formatDate(d.delivered_at) : formatDate(d.updated_at)}
                            {d.camp_filter_record?.name ? ` — ${d.camp_filter_record.name}` : ''}
                          </p>
                        </div>
                        <Badge variant="success">{distLabel(d.status)}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="mb-8 rounded-3xl border border-amber-100 bg-amber-50/30 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-amber-900">قيد الانتظار</h2>
                {pending.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">لا يوجد طرود بانتظار الاستلام.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {pending.map((d) => (
                      <li
                        key={d.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-100 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {d.package_type?.name || d.package_label || 'طرد'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(d.created_at)}
                            {d.camp_filter_record?.name ? ` — ${d.camp_filter_record.name}` : ''}
                          </p>
                        </div>
                        <Badge variant="warning">{distLabel(d.status)}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {other.length > 0 ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">حالات أخرى</h2>
                  <ul className="mt-4 space-y-3">
                    {other.map((d) => (
                      <li
                        key={d.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 px-4 py-3"
                      >
                        <span className="font-medium">{d.package_type?.name || d.package_label || 'طرد'}</span>
                        <Badge variant="default">{distLabel(d.status)}</Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : null}
        </main>

        <Footer />
      </div>
    </div>
  );
}
