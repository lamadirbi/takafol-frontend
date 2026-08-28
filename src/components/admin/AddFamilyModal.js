'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import FamilySchemaFields from '@/components/admin/FamilySchemaFields';
import { buildFamilyPayload, enabledFamilyFields, isFamilyFieldMissing } from '@/lib/familyFormSchema';

export default function AddFamilyModal({ open, onClose, onCreated, onSaved }) {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setError('');
    setAttempted(false);
    (async () => {
      try {
        const { data } = await api.get('/admin/family-form-schema');
        const list = enabledFamilyFields(data);
        if (cancelled) return;
        setFields(list);
        setForm((prev) => {
          const next = { ...prev };
          for (const field of list) {
            if (next[field.key] == null) next[field.key] = '';
          }
          return next;
        });
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'تعذر تحميل حقول العائلات.'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setAttempted(true);
    const missing = fields.some((field) => isFamilyFieldMissing(field, form[field.key]));
    if (missing) {
      setError('يوجد حقول مطلوبة فارغة. أكمل البيانات أولاً.');
      return;
    }
    const payload = buildFamilyPayload(fields, form);
    const headName = String(payload.head_name || '').trim();
    const nationalId = String(payload.national_id || '').trim();
    if (!headName || !nationalId) {
      setError('اسم رب الأسرة ورقم الهوية مطلوبان.');
      return;
    }
    payload.family_national_id = nationalId;
    payload.members = [
      {
        name: headName,
        age: null,
        relationship: 'رب الأسرة',
        gender: payload.head_gender || 'unknown',
        date_of_birth: payload.date_of_birth || null,
      },
    ];
    setSubmitting(true);
    try {
      await api.post('/admin/families', payload);
      setForm({});
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
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>
        ) : null}
        <FamilySchemaFields fields={fields} values={form} onChange={setField} attempted={attempted} />
        <p className="text-xs text-muted-foreground">
          يُنشأ تلقائياً رقم دخول للعائلة (يظهر في الجدول بجانب الاسم) ويُسلَّم من إدارة المخيم بعد الحفظ.
        </p>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={submitting} loading={submitting}>
            حفظ العائلة
          </Button>
        </div>
      </form>
    </Modal>
  );
}
