'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import { FAMILY_FINANCIAL_OPTIONS } from '@/lib/memberOptions';

const emptyForm = () => ({
  national_id: '',
  head_name: '',
  phone: '',
  social_status: 'married',
  financial_status: 'low',
  total_members: '1',
});

export default function AddFamilyModal({ open, onClose, onCreated, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  const isBlank = (v) => String(v ?? '').trim() === '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setAttempted(true);
    setSubmitting(true);
    const total = parseInt(form.total_members, 10);
    if (Number.isNaN(total) || total < 1) {
      setError('عدد الأفراد يجب أن يكون 1 على الأقل.');
      setSubmitting(false);
      return;
    }
    if (isBlank(form.national_id) || isBlank(form.head_name)) {
      setError('يوجد حقول مطلوبة فارغة. أكمل البيانات أولاً.');
      setSubmitting(false);
      return;
    }

    const headName = form.head_name.trim();
    const nationalId = form.national_id.trim();
    const payload = {
      national_id: nationalId,
      family_national_id: nationalId,
      head_name: headName,
      phone: form.phone.trim() || null,
      social_status: form.social_status || null,
      financial_status: form.financial_status || null,
      total_members: total,
      members: [
        {
          name: headName,
          age: null,
          relationship: 'رب الأسرة',
          gender: 'unknown',
        },
      ],
    };

    try {
      await api.post('/admin/families', payload);
      setForm(emptyForm());
      onCreated?.();
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إضافة العائلة.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="إضافة عائلة جديدة" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        ) : null}
        <Input
          label="رقم هوية رب الأسرة (للدخول)"
          name="national_id"
          value={form.national_id}
          onChange={(e) => setField('national_id', e.target.value)}
          error={attempted && isBlank(form.national_id) ? 'مطلوب' : ''}
          required
        />
        <Input
          label="اسم رب الأسرة"
          name="head_name"
          value={form.head_name}
          onChange={(e) => setField('head_name', e.target.value)}
          error={attempted && isBlank(form.head_name) ? 'مطلوب' : ''}
          required
        />
        <Input
          label="جوال"
          name="phone"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          inputMode="tel"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="الحالة الاجتماعية"
            name="social_status"
            value={form.social_status}
            onChange={(e) => setField('social_status', e.target.value)}
            options={[
              { value: 'married', label: 'متزوج' },
              { value: 'widowed', label: 'أرمل' },
              { value: 'separated', label: 'منفصل' },
              { value: 'abandoned', label: 'مهجور' },
            ]}
          />
          <Select
            label="الوضع المادي"
            name="financial_status"
            value={form.financial_status}
            onChange={(e) => setField('financial_status', e.target.value)}
            options={FAMILY_FINANCIAL_OPTIONS}
          />
        </div>
        <Input
          label="عدد أفراد الأسرة"
          name="total_members"
          type="number"
          min={1}
          value={form.total_members}
          onChange={(e) => setField('total_members', e.target.value)}
          error={attempted && (form.total_members === '' || Number.isNaN(parseInt(form.total_members, 10))) ? 'مطلوب' : ''}
          required
        />
        <p className="text-xs text-muted-foreground">
          يُنشأ تلقائياً رقم دخول للعائلة (يظهر في الجدول بجانب الاسم) ويُسلَّم من إدارة المخيم بعد الحفظ.
        </p>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'جاري الحفظ…' : 'حفظ العائلة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
