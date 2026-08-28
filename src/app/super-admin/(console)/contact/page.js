'use client';

import { useCallback, useEffect, useState } from 'react';
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

function kindLabel(kind) {
  if (kind === 'platform_change') return 'طلب تعديل على المنصة';
  if (kind === 'issue') return 'مشكلة أو ملاحظة';
  return 'استفسار';
}

function statusMeta(status) {
  if (status === 'closed') return { label: 'مغلق', variant: 'success' };
  if (status === 'in_progress') return { label: 'قيد المتابعة', variant: 'secondary' };
  return { label: 'جديد', variant: 'warning' };
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

export default function SuperAdminContactPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [kindFilter, setKindFilter] = useState('');
  const [review, setReview] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/platform-contact-messages', {
        params: {
          page,
          per_page: 20,
          ...(filter ? { status: filter } : {}),
          ...(kindFilter ? { kind: kindFilter } : {}),
        },
      });
      const { items: list, total: t } = unwrapPaginated(res);
      setItems(list);
      setTotal(t);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filter, kindFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openReview = (row, status) => {
    setReview({ row, status });
    setNote(row.admin_note || '');
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
    setSaving(true);
    setError('');
    try {
      await api.patch(`/admin/platform-contact-messages/${review.row.id}`, {
        status: review.status,
        admin_note: note.trim() || null,
      });
      setReview(null);
      setNote('');
      fetchItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حفظ الحالة.'));
    } finally {
      setSaving(false);
    }
  };

  const statusFilters = [
    { id: 'pending', label: 'جديد' },
    { id: 'in_progress', label: 'قيد المتابعة' },
    { id: 'closed', label: 'مغلق' },
    { id: '', label: 'الكل' },
  ];

  const kindFilters = [
    { id: '', label: 'كل الأنواع' },
    { id: 'inquiry', label: 'استفسار' },
    { id: 'platform_change', label: 'تعديل المنصة' },
    { id: 'issue', label: 'مشكلة' },
  ];

  const reviewTitle =
    review?.status === 'closed' ? 'إغلاق الرسالة' : review?.status === 'in_progress' ? 'وضع قيد المتابعة' : 'تحديث الحالة';

  return (
    <SuperAdminShell
      title="رسائل التواصل"
      description="استفسارات وطلبات تعديل المنصة من المستخدمين"
      extras={
        <Modal open={Boolean(review)} onClose={closeReview} title={reviewTitle}>
          {review ? (
            <form onSubmit={submitReview} className="space-y-4">
              <p className="text-sm font-medium">
                {review.row.name} — {kindLabel(review.row.kind)}
              </p>
              <Textarea
                id="contact-admin-note"
                label="ملاحظة داخلية (اختياري)"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                hint="مثال: تم الرد عبر واتساب، أو التعديل سيُدرس في التحديث القادم."
              />
              {error ? <Alert>{error}</Alert> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeReview} disabled={saving}>
                  إلغاء
                </Button>
                <Button type="submit" loading={saving}>
                  حفظ
                </Button>
              </div>
            </form>
          ) : null}
        </Modal>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        الرسائل تصل من صفحة <strong className="font-medium text-foreground">تواصل</strong>. راجعوا الطلب، ردّوا عبر
        واتساب إن لزم، ثم ضعوه قيد المتابعة أو أغلقوه.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {statusFilters.map((item) => (
          <Button
            key={item.id || 'all-status'}
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
      <div className="mb-4 flex flex-wrap gap-2">
        {kindFilters.map((item) => (
          <Button
            key={item.id || 'all-kind'}
            type="button"
            size="sm"
            variant={kindFilter === item.id ? 'primary' : 'outline'}
            onClick={() => {
              setKindFilter(item.id);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <NameList
        title="الرسائل"
        items={items}
        loading={loading}
        emptyMessage={filter === 'pending' ? 'لا توجد رسائل جديدة.' : 'لا توجد رسائل في هذا التصنيف.'}
        getId={(r) => r.id}
        getTitle={(r) => r.name || 'بدون اسم'}
        getSubtitle={(r) => `${kindLabel(r.kind)}${r.camp_name ? ` — ${r.camp_name}` : ''}`}
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
          const chatHref = waHref(
            row.whatsapp_phone,
            `السلام عليكم ${row.name}، بخصوص رسالتكم على منصة تَكافل.`
          );
          return (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="المرسل">{row.name || '—'}</Field>
                <Field label="النوع">{kindLabel(row.kind)}</Field>
                <Field label="واتساب">
                  <span dir="ltr">{row.whatsapp_phone || '—'}</span>
                </Field>
                <Field label="المخيم">{row.camp_name || 'غير محدد'}</Field>
                <Field label="تاريخ الإرسال">{formatDate(row.created_at) || '—'}</Field>
                <Field label="الحالة">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </Field>
              </div>
              <Field label="الرسالة">
                <p className="whitespace-pre-wrap">{row.message}</p>
              </Field>
              {row.admin_note ? (
                <Field label="ملاحظة الإدارة">
                  <p className="whitespace-pre-wrap">{row.admin_note}</p>
                </Field>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {chatHref ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(chatHref, '_blank', 'noopener,noreferrer')}
                  >
                    <IconWhatsApp className="h-4 w-4 text-[#128C7E]" />
                    واتساب
                  </Button>
                ) : null}
                {row.status !== 'in_progress' ? (
                  <Button size="sm" variant="outline" onClick={() => openReview(row, 'in_progress')}>
                    قيد المتابعة
                  </Button>
                ) : null}
                {row.status !== 'closed' ? (
                  <Button size="sm" onClick={() => openReview(row, 'closed')}>
                    إغلاق
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => openReview(row, 'pending')}>
                    إعادة الفتح
                  </Button>
                )}
              </div>
            </div>
          );
        }}
      />
    </SuperAdminShell>
  );
}
