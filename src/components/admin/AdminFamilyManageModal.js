'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { api } from '@/lib/api';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { RELATIONSHIP_OPTIONS } from '@/lib/memberOptions';
import FamilySchemaFields from '@/components/admin/FamilySchemaFields';
import {
  buildFamilyPayload,
  enabledFamilyFields,
  formFromFamily,
  isFamilyFieldMissing,
} from '@/lib/familyFormSchema';

function unwrapFamily(res) {
  const root = res?.data;
  return root?.data ?? root;
}

const GENDER_OPTS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'unknown', label: 'غير محدد' },
];

function relationshipSelectOptions(stored) {
  if (stored && !RELATIONSHIP_OPTIONS.some((o) => o.value === stored)) {
    return [{ value: stored, label: `${stored} (تحديث مطلوب)` }, ...RELATIONSHIP_OPTIONS];
  }
  return RELATIONSHIP_OPTIONS;
}


export default function AdminFamilyManageModal({ open, onClose, familyId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [members, setMembers] = useState([]);
  /** @type {null | { kind: 'member', member: object } | { kind: 'family' }} */
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    setError('');
    try {
      const [familyRes, schemaRes] = await Promise.all([
        api.get(`/admin/families/${familyId}`),
        api.get('/admin/family-form-schema'),
      ]);
      const f = unwrapFamily(familyRes);
      const list = enabledFamilyFields(schemaRes.data);
      setFields(list);
      setForm({
        ...formFromFamily(list, f, { login_serial: f.login_serial ?? '' }),
        social_status: f.social_status === 'single' ? 'separated' : (f.social_status ?? ''),
      });
      const m = Array.isArray(f.members) ? f.members : [];
      setMembers(
        m.map((row) => {
          const r = row?.data ?? row;
          return {
            id: r.id,
            name: r.name ?? '',
            date_of_birth: r.date_of_birth ?? '',
            relationship: r.relationship ?? '',
            gender: r.gender ?? 'unknown',
          };
        })
      );
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذر تحميل بيانات العائلة.'));
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    if (open && familyId) load();
  }, [open, familyId, load]);

  function setField(k, v) {
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  const isBlank = (v) => String(v ?? '').trim() === '';

  const familyIncomplete =
    !form || fields.some((field) => isFamilyFieldMissing(field, form[field.key]));

  const memberIncomplete = (m) =>
    isBlank(m?.name) || isBlank(m?.date_of_birth) || isBlank(m?.relationship);

  async function saveFamily(e) {
    e?.preventDefault?.();
    if (!form || !familyId) return;
    setSaving(true);
    setError('');
    if (fields.some((field) => isFamilyFieldMissing(field, form[field.key]))) {
      setError('يوجد حقول مطلوبة فارغة. أكمل البيانات أولاً.');
      setSaving(false);
      return;
    }
    try {
      const payload = buildFamilyPayload(fields, form);
      await api.patch(`/admin/families/${familyId}`, payload);
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حفظ بيانات العائلة.'));
    } finally {
      setSaving(false);
    }
  }

  async function saveMember(m) {
    if (!familyId || !m.id) return;
    setSaving(true);
    setError('');
    try {
      await api.patch(`/admin/families/${familyId}/members/${m.id}`, {
        name: m.name.trim(),
        date_of_birth: m.date_of_birth?.trim() || null,
        relationship: m.relationship || null,
        gender: m.gender,
      });
      await load();
      onSaved?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حفظ بيان الفرد.'));
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    if (!familyId) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/admin/families/${familyId}/members`, {
        name: 'فرد جديد',
        date_of_birth: null,
        relationship: 'ابن',
        gender: 'unknown',
      });
      await load();
      onSaved?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إضافة فرد.'));
    } finally {
      setSaving(false);
    }
  }

  function askRemoveMember(m) {
    if (!familyId || !m.id) return;
    setDeleteConfirm({ kind: 'member', member: m });
  }

  function askRemoveFamily() {
    if (!familyId) return;
    setDeleteConfirm({ kind: 'family' });
  }

  async function executeDeleteConfirm() {
    if (!deleteConfirm || !familyId) return;
    setSaving(true);
    setError('');
    try {
      if (deleteConfirm.kind === 'member') {
        const m = deleteConfirm.member;
        await api.delete(`/admin/families/${familyId}/members/${m.id}`);
        await load();
        onSaved?.();
      } else {
        await api.delete(`/admin/families/${familyId}`);
        onSaved?.();
        onClose?.();
      }
      setDeleteConfirm(null);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          deleteConfirm.kind === 'member' ? 'تعذر الحذف.' : 'تعذر حذف العائلة.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  function updateMemberLocal(idx, field, value) {
    setMembers((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  return (
    <>
    <Modal open={open} onClose={onClose} title="تعديل العائلة والأفراد" className="max-w-3xl">
      {loading ? (
        <p className="text-sm text-muted-foreground">جاري التحميل…</p>
      ) : null}
      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>
      ) : null}

      {form ? (
        <div className="space-y-6" dir="rtl">
          <form
            onSubmit={saveFamily}
            className={cn(
              'space-y-3 rounded-2xl border p-4',
              familyIncomplete
                ? 'border-red-200 bg-red-50/70'
                : 'border-slate-200 bg-slate-50/80'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800">بيانات العائلة</h4>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  familyIncomplete ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                )}
              >
                {familyIncomplete ? 'غير مكتمل' : 'مكتمل'}
              </span>
            </div>
            {form.login_serial ? (
              <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">رقم الدخول: </span>
                <span dir="ltr" className="font-mono font-semibold text-primary">
                  {form.login_serial}
                </span>
              </p>
            ) : null}
            <FamilySchemaFields fields={fields} values={form} onChange={setField} attempted />
            <Button type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ…' : 'حفظ بيانات العائلة'}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800">أفراد الأسرة</h4>
              <Button type="button" variant="outline" size="sm" onClick={addMember} disabled={saving}>
                + إضافة فرد
              </Button>
            </div>
            <div className="space-y-4">
              {members.map((m, idx) => (
                <div
                  key={m.id ?? idx}
                  className={cn(
                    'rounded-2xl border p-3 shadow-sm',
                    memberIncomplete(m) ? 'border-red-200 bg-red-50/60' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">بيانات فرد</p>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        memberIncomplete(m) ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {memberIncomplete(m) ? 'غير مكتمل' : 'مكتمل'}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      label="الاسم"
                      value={m.name}
                      onChange={(e) => updateMemberLocal(idx, 'name', e.target.value)}
                      error={isBlank(m.name) ? 'مطلوب' : ''}
                    />
                    <Input
                      label="تاريخ الميلاد"
                      type="date"
                      value={m.date_of_birth}
                      onChange={(e) => updateMemberLocal(idx, 'date_of_birth', e.target.value)}
                      error={isBlank(m.date_of_birth) ? 'مطلوب' : ''}
                    />
                    <Select
                      label="صلة القرابة"
                      value={m.relationship || ''}
                      onChange={(e) => updateMemberLocal(idx, 'relationship', e.target.value)}
                      options={relationshipSelectOptions(m.relationship)}
                    />
                    <Select
                      label="الجنس"
                      value={m.gender}
                      onChange={(e) => updateMemberLocal(idx, 'gender', e.target.value)}
                      options={GENDER_OPTS}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => saveMember(m)} disabled={saving || !m.id}>
                      حفظ الفرد
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => askRemoveMember(m)}
                      disabled={saving || !m.id}
                    >
                      حذف الفرد
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" className="border-red-300 text-red-800" onClick={askRemoveFamily} disabled={saving}>
              حذف العائلة بالكامل
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
    <ConfirmDialog
      nested
      open={deleteConfirm != null}
      onClose={() => !saving && setDeleteConfirm(null)}
      onConfirm={executeDeleteConfirm}
      title="تأكيد الحذف"
      message={
        deleteConfirm?.kind === 'member'
          ? 'حذف هذا الفرد من السجل؟'
          : 'حذف العائلة بالكامل من النظام؟ لا يمكن التراجع عن هذا الإجراء.'
      }
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      danger
      loading={saving}
    />
    </>
  );
}
