'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import NameList from '@/components/super-admin/NameList';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import { IconWhatsApp } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { formatDate, getApiErrorMessage, unwrapPaginated } from '@/lib/utils';

const REJECT_REASONS = [
  'رقم الواتساب غير صالح أو لا يمكن التواصل عليه',
  'اسم المخيم غير واضح أو مكرر لمخيم موجود',
  'بيانات اللجنة ناقصة ولا تكفي لإنشاء الحساب',
  'الطلب لا يخص منصة تَكافل',
];

function statusMeta(status) {
  if (status === 'approved') return { label: 'معتمد', variant: 'success' };
  if (status === 'rejected') return { label: 'مرفوض', variant: 'danger' };
  return { label: 'قيد المراجعة', variant: 'warning' };
}

function waDigits(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `970${digits.slice(1)}`;
  return digits;
}

function waHref(phone, text) {
  const n = waDigits(phone);
  if (!n) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${n}${q}`;
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[length:var(--text-caption)] tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export default function SuperAdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [review, setReview] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/camp-registration-requests', {
        params: { page, per_page: 20, ...(filter ? { status: filter } : {}) },
      });
      const { items, total: t } = unwrapPaginated(res);
      setRequests(items);
      setTotal(t);
    } catch {
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openReview = (row, action) => {
    setReview({ row, action });
    setNote(action === 'rejected' ? '' : row.admin_note || '');
    setError('');
  };

  const closeReview = () => {
    if (saving) return;
    setReview(null);
    setNote('');
    setError('');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review) return;
    const reason = note.trim();
    if (review.action === 'rejected' && !reason) {
      setError('اكتب سبب الرفض، أو اختر سبباً جاهزاً.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/admin/camp-registration-requests/${review.row.id}`, {
        status: review.action,
        admin_note: reason || null,
      });
      const row = review.row;
      setReview(null);
      setNote('');
      fetchRequests();
      setDone({
        action: review.action,
        row,
        note: reason,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حفظ القرار.'));
    } finally {
      setSaving(false);
    }
  };

  const filters = [
    { id: 'pending', label: 'قيد المراجعة' },
    { id: 'approved', label: 'معتمد' },
    { id: 'rejected', label: 'مرفوض' },
    { id: '', label: 'الكل' },
  ];

  return (
    <SuperAdminShell
      title="طلبات تسجيل مخيمات"
      description="راجع الطلب ثم اعتمد أو ارفض مع سبب واضح"
      extras={
        <>
          <Modal
            open={Boolean(review)}
            onClose={closeReview}
            title={review?.action === 'rejected' ? 'سبب رفض الطلب' : 'اعتماد الطلب'}
          >
            {review ? (
              <form onSubmit={submitReview} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {review.action === 'rejected'
                    ? 'السبب يُحفظ في السجل، وهو ما تعتمد عليه عند إبلاغ مقدّم الطلب عبر واتساب. اختر سبباً جاهزاً أو اكتبه بنفسك.'
                    : 'الاعتماد لا ينشئ المخيم تلقائياً. بعد الاعتماد أنشئ المخيم من صفحة المخيمات ثم أرسل رابط الدخول عبر واتساب.'}
                </p>
                <p className="text-sm font-medium">
                  {review.row.applicant_name} — {review.row.camp_name}
                </p>
                {review.action === 'rejected' ? (
                  <div className="flex flex-wrap gap-2">
                    {REJECT_REASONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setNote(reason)}
                        className={`min-h-11 rounded-[var(--radius-control)] border px-3 py-2 text-start text-xs ${
                          note === reason
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted/60'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                ) : null}
                <Textarea
                  id="admin-note"
                  label={review.action === 'rejected' ? 'سبب الرفض' : 'ملاحظة داخلية (اختياري)'}
                  required={review.action === 'rejected'}
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  hint={
                    review.action === 'rejected'
                      ? 'مثال: الرقم لا يعمل، أو اسم المخيم مكرر.'
                      : 'مثال: تم التواصل وسيُنشأ المخيم اليوم.'
                  }
                />
                {error ? <Alert>{error}</Alert> : null}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeReview} disabled={saving}>
                    إلغاء
                  </Button>
                  <Button type="submit" variant={review.action === 'rejected' ? 'danger' : 'primary'} loading={saving}>
                    {review.action === 'rejected' ? 'تأكيد الرفض' : 'تأكيد الاعتماد'}
                  </Button>
                </div>
              </form>
            ) : null}
          </Modal>

          <Modal open={Boolean(done)} onClose={() => setDone(null)} title={done?.action === 'rejected' ? 'تم رفض الطلب' : 'تم اعتماد الطلب'}>
            {done ? (
              <div className="space-y-4 text-sm">
                {done.action === 'rejected' ? (
                  <>
                    <p className="text-muted-foreground">أبلغ مقدّم الطلب بسبب الرفض عبر واتساب:</p>
                    <p className="border border-border bg-muted/50 px-3 py-2">{done.note}</p>
                    {waHref(
                      done.row.whatsapp_phone,
                      `السلام عليكم ${done.row.applicant_name}، بخصوص طلب تسجيل «${done.row.camp_name}»: نعتذر عن قبول الطلب لأن ${done.note}.`
                    ) ? (
                      <a
                        href={waHref(
                          done.row.whatsapp_phone,
                          `السلام عليكم ${done.row.applicant_name}، بخصوص طلب تسجيل «${done.row.camp_name}»: نعتذر عن قبول الطلب لأن ${done.note}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 text-primary"
                      >
                        <IconWhatsApp className="h-4 w-4 text-[#128C7E]" />
                        فتح واتساب
                      </a>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">الخطوة التالية: أنشئ المخيم من صفحة المخيمات، ثم أرسل رابط الدخول لصاحب الطلب.</p>
                    <Link href="/super-admin/camps" className="inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline">
                      الذهاب إلى المخيمات
                    </Link>
                  </>
                )}
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setDone(null)}>
                    تم
                  </Button>
                </div>
              </div>
            ) : null}
          </Modal>
        </>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        الطلب يصل من الصفحة الرئيسية. <strong className="font-medium text-foreground">الاعتماد</strong> يعني أن اللجنة مناسبة، وبعده تنشئ المخيم يدوياً.
        <strong className="font-medium text-foreground"> الرفض</strong> يحتاج سبباً واضحاً (رقم خاطئ، مخيم مكرر، بيانات ناقصة…) ليُحفظ ويُرسل عبر واتساب.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.id || 'all'}
            type="button"
            size="sm"
            variant={filter === item.id ? 'primary' : 'outline'}
            onClick={() => {
              setFilter(item.id);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <NameList
        title="الطلبات"
        items={requests}
        loading={loading}
        emptyMessage={filter === 'pending' ? 'لا توجد طلبات قيد المراجعة.' : 'لا توجد طلبات في هذا التصنيف.'}
        getId={(r) => r.id}
        getTitle={(r) => r.applicant_name || 'بدون اسم'}
        getSubtitle={(r) => r.camp_name || 'بدون اسم مخيم'}
        renderBadge={(r) => {
          const meta = statusMeta(r.status);
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        }}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
        renderDetails={(row) => {
          const meta = statusMeta(row.status);
          const chatHref = waHref(row.whatsapp_phone);
          return (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="مقدّم الطلب">{row.applicant_name || '—'}</Field>
                <Field label="المخيم المقترح">{row.camp_name || '—'}</Field>
                <Field label="واتساب التواصل">
                  <span dir="ltr">{row.whatsapp_phone || '—'}</span>
                </Field>
                <Field label="واتساب الدفع">
                  <span dir="ltr">{row.payment_notification_whatsapp || 'غير محدد'}</span>
                </Field>
                <Field label="تاريخ الطلب">{formatDate(row.created_at) || '—'}</Field>
                <Field label="الحالة">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </Field>
              </div>
              {row.message ? (
                <Field label="رسالة مقدّم الطلب">
                  <p className="whitespace-pre-wrap">{row.message}</p>
                </Field>
              ) : null}
              {row.admin_note ? (
                <Field label={row.status === 'rejected' ? 'سبب الرفض' : 'ملاحظة الإدارة'}>
                  <p className="whitespace-pre-wrap">{row.admin_note}</p>
                </Field>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {chatHref ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => window.open(chatHref, '_blank', 'noopener,noreferrer')}>
                    <IconWhatsApp className="h-4 w-4 text-[#128C7E]" />
                    واتساب
                  </Button>
                ) : null}
                {row.status === 'pending' ? (
                  <>
                    <Button size="sm" onClick={() => openReview(row, 'approved')}>
                      اعتماد
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => openReview(row, 'rejected')}>
                      رفض مع سبب
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        }}
      />
    </SuperAdminShell>
  );
}
