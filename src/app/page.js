'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import InstallPwaButton from '@/components/ui/InstallPwaButton';

const SUPPORT_WA =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) || '970592533678';
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

function waDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

export default function GlobalHomePage() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campQuery, setCampQuery] = useState('');

  const [form, setForm] = useState({
    applicant_name: '',
    camp_name: '',
    whatsapp_phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await api.get('/camps');
        setCamps(response.data);
      } catch (err) {
        console.error('Failed to fetch camps:', err);
        setError('تعذر جلب قائمة المخيمات. يرجى المحاولة لاحقاً.');
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  async function handleRequestSubmit(e) {
    e.preventDefault();
    setFormErr('');
    setFormMsg('');
    setSubmitting(true);
    try {
      await api.post('/camp-registration-requests', {
        applicant_name: form.applicant_name.trim(),
        camp_name: form.camp_name.trim(),
        whatsapp_phone: form.whatsapp_phone.trim(),
        message: form.message.trim() || undefined,
      });
      setFormMsg(
        'تم إرسال طلبك. عند تفعيل مخيمك سيتم منحك 14 يوم تجربة مجانية لإضافة العائلات وتجربة النظام. بعد ذلك يظهر عدّاد تجديد الاشتراك في لوحة إدارة المخيم.'
      );
      setForm({
        applicant_name: '',
        camp_name: '',
        whatsapp_phone: '',
        message: '',
      });
    } catch (err) {
      setFormErr(getApiErrorMessage(err, 'تعذر إرسال الطلب.'));
    } finally {
      setSubmitting(false);
    }
  }

  const supportHref = `https://wa.me/${waDigits(SUPPORT_WA)}`;
  const q = campQuery.trim().toLowerCase();
  const filteredCamps = q
    ? camps.filter((c) => String(c?.name ?? '').toLowerCase().includes(q) || String(c?.slug ?? '').toLowerCase().includes(q))
    : camps;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-800" dir="rtl">
      <div className="w-full bg-slate-900 px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/super-admin/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            إدارة المنصة (تأسيس المخيمات)
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <InstallPwaButton className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 hover:ring-0" />
            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            >
              واتساب للتواصل
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:py-14">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary md:text-5xl">تَكافل</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 md:text-lg">
            منصة لإدارة المساعدات والمخيمات بشفافية. اختر مخيماً مسجّلاً للدخول، أو أرسل طلباً لتسجيل
            مخيمك الجديد.
          </p>
        </div>

        <section className="mt-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" dir="rtl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">المخيمات المسجّلة</h2>
                <p className="mt-1 text-sm text-slate-600">
                  اختر المخيم ثم ادخل كـ عائلة أو إدارة، أو افتح صفحة المخيم الرئيسية.
                </p>
              </div>
              <div className="w-full sm:w-80">
                <label className="block text-sm font-semibold text-slate-700">بحث عن مخيم</label>
                <input
                  value={campQuery}
                  onChange={(e) => setCampQuery(e.target.value)}
                  placeholder="اكتب اسم المخيم أو الـ slug"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="mt-6 mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
                {error}
              </div>
            ) : filteredCamps.length === 0 ? (
              <p className="mt-6 text-center text-slate-500">
                {q ? 'لا يوجد مخيم مطابق لبحثك.' : 'لا توجد مخيمات مفعلة حالياً.'}
              </p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <ul className="divide-y divide-slate-100">
                  {filteredCamps.map((camp) => (
                  <li
                    key={camp.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        {camp.logo_path ? (
                          <Image
                            src={camp.logo_path}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-contain"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{camp.name}</p>
                        <p className="font-mono text-xs text-slate-500" dir="ltr">
                          /{camp.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/${camp.slug}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        صفحة المخيم
                      </Link>
                      {camp.families_portal_locked ? (
                        <span
                          className="cursor-not-allowed rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900"
                          title="دخول العائلات معطّل حتى يُجدَّد اشتراك المخيم"
                        >
                          دخول عائلة (معلق)
                        </span>
                      ) : (
                        <Link
                          href={`/${camp.slug}/login`}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          دخول عائلة
                        </Link>
                      )}
                      <Link
                        href={`/${camp.slug}/login/admin`}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-95"
                      >
                        دخول الإدارة
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-bold text-slate-900">طلب تسجيل مخيم جديد</h2>
            <p className="mt-2 text-sm text-slate-600">
              املأ البيانات وسنتواصل معك عبر واتساب لإنشاء الحساب وإرسال رابط المخيم بعد التجهيز.
            </p>
            <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4">
              {formErr ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {formErr}
                </p>
              ) : null}
              {formMsg ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  {formMsg}
                </p>
              ) : null}
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">اسم صاحب الطلب</span>
                <input
                  required
                  value={form.applicant_name}
                  onChange={(e) => setForm((f) => ({ ...f, applicant_name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">اسم المخيم المقترح</span>
                <input
                  required
                  value={form.camp_name}
                  onChange={(e) => setForm((f) => ({ ...f, camp_name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">رقم واتساب للتواصل</span>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="مثال: 9665xxxxxxxx"
                  value={form.whatsapp_phone}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp_phone: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  dir="ltr"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">ملاحظات (اختياري)</span>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال…' : 'إرسال الطلب'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 md:p-8">
            <h2 className="text-lg font-bold text-emerald-900">تواصل عبر واتساب</h2>
            <p className="mt-2 text-sm text-slate-700">
              لاستفسارات تأسيس المخيمات أو الدعم الفني، راسلنا على واتساب وسنرد بأقرب وقت.
            </p>
            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              فتح واتساب
            </a>
            <p className="mt-3 text-xs text-slate-500" dir="ltr">
              {supportHref}
            </p>
          </section>
        </div>

        <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm md:p-8" dir="rtl">
          <h2 className="text-lg font-bold text-amber-950">وسائل الدفع</h2>
          <p className="mt-2 text-sm text-amber-900">
            يمكن إرسال إشعار الدفع عبر الطرق التالية:
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {PAYMENT_METHODS.map((item) => (
              <div key={item.method} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm">
                <p className="font-bold text-slate-900">{item.method}</p>
                <p className="mt-1 text-slate-700" dir="ltr">
                  {item.number}
                </p>
                <p className="mt-1 text-slate-600">الاسم: {item.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500" dir="rtl">
        <div>تَكافل — تنظيم المساعدات بكرامة</div>
        <div className="mt-1 text-slate-600" dir="ltr">radartech85@gmail.com</div>
      </footer>
    </div>
  );
}
