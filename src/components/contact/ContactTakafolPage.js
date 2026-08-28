'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicShell from '@/components/layout/PublicShell';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import { IconWhatsApp } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';

const SUPPORT_WA =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) || '970592533678';

const KIND_OPTIONS = [
  { value: 'inquiry', label: 'استفسار' },
  { value: 'platform_change', label: 'طلب تعديل على المنصة' },
  { value: 'issue', label: 'مشكلة أو ملاحظة' },
];

function waDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

export default function ContactTakafolPage() {
  const { camp } = useCamp() || {};
  const { familyUser, adminUser } = useAuth();
  const knownName = familyUser?.name || adminUser?.name || '';

  const [form, setForm] = useState({
    name: '',
    whatsapp_phone: '',
    camp_name: '',
    kind: 'inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || knownName,
      camp_name: prev.camp_name || camp?.name || '',
    }));
  }, [knownName, camp?.name]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setDone(false);
    setSubmitting(true);
    try {
      await api.post('/platform-contact-messages', {
        name: form.name.trim(),
        whatsapp_phone: form.whatsapp_phone.trim(),
        camp_name: form.camp_name.trim() || undefined,
        kind: form.kind,
        message: form.message.trim(),
      });
      setDone(true);
      setForm({
        name: knownName,
        whatsapp_phone: '',
        camp_name: camp?.name || '',
        kind: 'inquiry',
        message: '',
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إرسال الرسالة. حاولوا مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  }

  const supportHref = `https://wa.me/${waDigits(SUPPORT_WA)}`;

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:py-8" dir="rtl">
        <h1 className="text-[length:var(--text-h2)] font-semibold tracking-tight">تواصل مع إدارة المنصة</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          اكتبوا استفساراً أو طلب تعديل على تَكافل. الرسالة تصل للإدارة العليا مباشرة، ويتواصلون معكم عبر واتساب عند
          الحاجة. لتسجيل مخيم جديد استخدموا{' '}
          <Link href="/#register" className="font-semibold text-primary underline-offset-4 hover:underline">
            طلب تسجيل مخيم
          </Link>
          .
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-5 shadow-sm md:p-6">
          {error ? <Alert>{error}</Alert> : null}
          {done ? (
            <Alert variant="success">
              تم إرسال رسالتكم. الإدارة العليا تراجع الطلبات وتتواصل عبر واتساب إذا لزم الأمر.
            </Alert>
          ) : null}

          <Input
            required
            id="contact-name"
            name="name"
            label="الاسم"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoComplete="name"
          />
          <Input
            required
            id="contact-phone"
            name="whatsapp_phone"
            type="tel"
            inputMode="tel"
            label="رقم واتساب للتواصل"
            placeholder="مثال: 0592533678"
            value={form.whatsapp_phone}
            onChange={(e) => setForm((f) => ({ ...f, whatsapp_phone: e.target.value }))}
            dir="ltr"
            autoComplete="tel"
          />
          <Input
            id="contact-camp"
            name="camp_name"
            label="اسم المخيم (إن وُجد)"
            value={form.camp_name}
            onChange={(e) => setForm((f) => ({ ...f, camp_name: e.target.value }))}
          />
          <Select
            id="contact-kind"
            name="kind"
            label="نوع الرسالة"
            required
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
            options={KIND_OPTIONS}
          />
          <Textarea
            required
            id="contact-message"
            name="message"
            label="الرسالة"
            rows={6}
            hint="صفوا الاستفسار أو التعديل المطلوب بوضوح."
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
          <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
            إرسال للإدارة العليا
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          تفضّلون واتساب مباشرة؟{' '}
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#128C7E] underline-offset-4 hover:underline"
          >
            <IconWhatsApp className="h-4 w-4" />
            راسلونا على واتساب
          </a>
        </p>
      </main>
      <Footer />
    </PublicShell>
  );
}
