'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import PublicShell from '@/components/layout/PublicShell';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import { campLogoSrc } from '@/lib/brand';
import { IconSearch, IconWhatsApp } from '@/components/ui/Icons';
import VideoGuideButton from '@/components/guide/VideoGuideButton';
import { useAuth } from '@/hooks/useAuth';
import { isGlobalSuperAdmin } from '@/lib/authSession';

const SUPPORT_WA =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) || '970592533678';

function waDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

export default function GlobalHomePage() {
  const { adminUser, adminLoading, familyLoading } = useAuth();
  const isSuper = isGlobalSuperAdmin(adminUser);
  const authReady = !adminLoading && !familyLoading;

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
    if (!authReady) return undefined;
    const fetchCamps = async () => {
      setLoading(true);
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
  }, [authReady]);

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
        'تم إرسال طلبك. الحساب مجاني لأسبوعين بعد التفعيل، وبعدها الاشتراك 50 شيكل كل شهر.'
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
    <PublicShell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8" dir="rtl">
        {isSuper ? (
        <section id="camps">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[length:var(--text-h2)] font-semibold tracking-tight">كل المخيمات</h1>
              <p className="mt-1 text-sm text-muted-foreground">ظاهر لإدارة المنصة فقط.</p>
            </div>
            <div className="w-full sm:w-80">
              <Input
                label="بحث عن مخيم"
                id="camp-search"
                value={campQuery}
                onChange={(e) => setCampQuery(e.target.value)}
                placeholder="اكتب اسم المخيم أو الرابط المختصر"
                icon={IconSearch}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-10 w-10 text-primary" label="جاري تحميل المخيمات" />
            </div>
          ) : error ? (
            <div className="mx-auto mt-8 max-w-lg border border-destructive/30 bg-(--stamp-fill) p-5 text-center text-destructive" role="alert">
              {error}
            </div>
          ) : filteredCamps.length === 0 ? (
            <p className="mt-10 text-center text-muted-foreground">
              {q ? 'لا يوجد مخيم مطابق لبحثك.' : 'لا توجد مخيمات مفعلة حالياً.'}
            </p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
              {filteredCamps.map((camp, i) => (
                <article key={camp.id} className={`flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${i > 0 ? 'border-t border-black/8' : ''}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#F0F2F5]">
                      {camp.logo_url || camp.logo_path ? (
                        <Image
                          src={campLogoSrc(camp)}
                          alt=""
                          width={44}
                          height={44}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">ت</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{camp.name}</h3>
                      <p className="font-mono text-xs tabular-nums text-muted-foreground" dir="ltr">
                        /{camp.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/${camp.slug}`}
                      className="inline-flex min-h-11 items-center px-2.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      صفحة المخيم
                    </Link>
                    <Link
                      href={`/super-admin/camps`}
                      className="inline-flex min-h-11 items-center px-2.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      إدارة المنصة
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        ) : (
        <section id="camps" className="scroll-mt-24">
          <h1 className="text-[length:var(--text-h2)] font-semibold tracking-tight">اختر مخيمك</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            دخول العائلات أو دخول الإدارة من نفس القائمة. لتسجيل مخيم جديد استخدم النموذج بالأسفل.
          </p>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-10 w-10 text-primary" label="جاري تحميل المخيمات" />
            </div>
          ) : error ? (
            <div className="mx-auto mt-6 max-w-lg border border-destructive/30 bg-(--stamp-fill) p-5 text-center text-destructive" role="alert">
              {error}
            </div>
          ) : filteredCamps.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">لا توجد مخيمات مفعلة حالياً. يمكنك طلب تسجيل مخيم من النموذج أدناه.</p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm">
              {filteredCamps.map((camp, i) => (
                <div
                  key={camp.id}
                  className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${i > 0 ? 'border-t border-black/8' : ''}`}
                >
                  <p className="min-w-0 font-semibold text-foreground">{camp.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/${camp.slug}/login`}
                      className="inline-flex min-h-10 items-center rounded-lg bg-[#E4E6EB] px-3 text-sm font-semibold text-foreground hover:bg-[#d8dadf]"
                    >
                      دخول العائلات
                    </Link>
                    <Link
                      href={`/${camp.slug}/login/admin`}
                      className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:brightness-95"
                    >
                      دخول الإدارة
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
          <section id="register" className="scroll-mt-24 rounded-xl bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-[length:var(--text-h3)] font-semibold tracking-tight">طلب تسجيل مخيم جديد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              الحساب مجاني لأسبوعين بعد التفعيل، وبعدها الاشتراك 50 شيكل كل شهر. املأ البيانات وسنتواصل عبر واتساب
              لإنشاء الحساب وإرسال رابط المخيم.
            </p>
            <div className="mt-3">
              <VideoGuideButton videoId="camp-register" />
            </div>
            <form onSubmit={handleRequestSubmit} className="mt-5 space-y-4">
              {formErr ? (
                <p className="border border-destructive/30 bg-(--stamp-fill) px-3 py-2 text-sm text-destructive" role="alert">
                  {formErr}
                </p>
              ) : null}
              {formMsg ? (
                <p className="border border-secondary/30 bg-(--mark-fill) px-3 py-2 text-sm text-secondary" role="status">
                  {formMsg}
                </p>
              ) : null}
              <Input
                required
                id="applicant_name"
                name="applicant_name"
                label="اسم صاحب الطلب"
                value={form.applicant_name}
                onChange={(e) => setForm((f) => ({ ...f, applicant_name: e.target.value }))}
                autoComplete="name"
              />
              <Input
                required
                id="camp_name"
                name="camp_name"
                label="اسم المخيم المقترح"
                value={form.camp_name}
                onChange={(e) => setForm((f) => ({ ...f, camp_name: e.target.value }))}
              />
              <Input
                required
                id="whatsapp_phone"
                name="whatsapp_phone"
                type="tel"
                inputMode="tel"
                label="رقم واتساب للتواصل"
                placeholder="مثال: 9665xxxxxxxx"
                value={form.whatsapp_phone}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp_phone: e.target.value }))}
                dir="ltr"
                autoComplete="tel"
              />
              <Textarea
                id="message"
                name="message"
                label="ملاحظات (اختياري)"
                rows={3}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
              <Button type="submit" disabled={submitting} loading={submitting} className="w-full">
                إرسال الطلب
              </Button>
            </form>
          </section>

          <section id="contact" className="scroll-mt-24 rounded-xl bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-[length:var(--text-h3)] font-semibold tracking-tight">تواصل مع إدارة المنصة</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              استفسار أو طلب تعديل على المنصة يصل للإدارة العليا من صفحة التواصل. يمكنكم أيضاً المراسلة على واتساب.
            </p>
            <Link href="/contact" className="mt-5 block">
              <Button type="button" className="w-full">
                فتح صفحة التواصل
              </Button>
            </Link>
            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-border bg-white py-3 text-sm font-semibold text-foreground hover:bg-muted/50"
            >
              <IconWhatsApp className="h-5 w-5 text-[#128C7E]" />
              واتساب
            </a>
          </section>
        </div>
      </main>

      <Footer compact />
    </PublicShell>
  );
}
