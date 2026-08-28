'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { getApiErrorMessage } from '@/lib/utils';

function newCustomField() {
  return {
    key: `custom_${Date.now().toString(36)}`,
    source: 'custom',
    enabled: true,
    required: false,
    label: '',
    excel_header: '',
    type: 'text',
    options: [],
  };
}

export default function FamilyFieldsSettingsPage() {
  const { camp } = useCamp();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [optionDraft, setOptionDraft] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/family-form-schema');
      setFields(Array.isArray(data?.fields) ? data.fields : []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر تحميل حقول العائلات.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch(index, next) {
    setFields((list) => list.map((row, i) => (i === index ? { ...row, ...next } : row)));
  }

  function move(index, dir) {
    setFields((list) => {
      const next = [...list];
      const to = index + dir;
      if (to < 0 || to >= next.length) return list;
      const tmp = next[index];
      next[index] = next[to];
      next[to] = tmp;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const payload = {
        fields: fields.map((f) => ({
          key: f.key,
          enabled: Boolean(f.enabled),
          required: Boolean(f.required),
          source: f.source,
          label: f.label,
          excel_header: f.excel_header || f.label,
          type: f.type,
          options: f.options,
        })),
      };
      const { data } = await api.put('/admin/family-form-schema', payload);
      setFields(Array.isArray(data?.fields) ? data.fields : fields);
      setMsg('تم حفظ حقول العائلات. النموذج صار حسب اختيارك، واستيراد الإكسل كمان بيقدر يعتمد أعمدة الملف.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حفظ الحقول.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="حقول العائلات" subtitle={camp?.name}>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        حدّد الحقول يدوياً، أو ارفع ملف إكسل من سجل العائلات: النظام بيعتمد أعمدة الملف كحقول. رقم الهوية واسم رب الأسرة
        لازم يضلوا ظاهرين لأنهم للدخول.
      </p>
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      {msg ? (
        <Alert variant="success" className="mb-4">
          {msg}
        </Alert>
      ) : null}
      {loading ? <p className="text-sm text-muted-foreground">جاري التحميل…</p> : null}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.key} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {field.source === 'custom' ? (
                  <Input
                    label="اسم الحقل"
                    value={field.label}
                    onChange={(e) =>
                      patch(index, { label: e.target.value, excel_header: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground">{field.label}</p>
                )}
                <p className="mt-1 text-xs text-[#65676B]">عمود الإكسل: {field.excel_header}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => move(index, -1)}>
                  أعلى
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => move(index, 1)}>
                  أسفل
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(field.enabled)}
                  disabled={field.locked}
                  onChange={(e) => patch(index, { enabled: e.target.checked })}
                />
                ظاهر في النموذج والإكسل
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  disabled={field.locked}
                  onChange={(e) => patch(index, { required: e.target.checked })}
                />
                مطلوب
              </label>
            </div>
            {field.source === 'custom' ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Select
                  label="نوع الحقل"
                  value={field.type}
                  onChange={(e) => patch(index, { type: e.target.value })}
                  options={[
                    { value: 'text', label: 'نص' },
                    { value: 'number', label: 'رقم' },
                    { value: 'date', label: 'تاريخ' },
                    { value: 'select', label: 'قائمة خيارات' },
                  ]}
                />
                {field.type === 'select' ? (
                  <Input
                    label="خيارات القائمة (سطر لكل خيار)"
                    value={optionDraft[field.key] ?? (field.options || []).map((o) => o.label).join('\n')}
                    onChange={(e) => {
                      const text = e.target.value;
                      setOptionDraft((d) => ({ ...d, [field.key]: text }));
                      patch(index, {
                        options: text
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((s) => ({ value: s, label: s })),
                      });
                    }}
                  />
                ) : null}
                <button
                  type="button"
                  className="text-sm font-semibold text-[#E41E3F]"
                  onClick={() => setFields((list) => list.filter((_, i) => i !== index))}
                >
                  حذف الحقل
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setFields((list) => [...list, newCustomField()])}>
          إضافة حقل جديد
        </Button>
        <Button type="button" onClick={save} disabled={saving || loading} loading={saving}>
          حفظ الحقول
        </Button>
      </div>
    </AdminShell>
  );
}
