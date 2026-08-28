'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { IconCheck, IconCopy } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';

function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="flex items-stretch gap-2">
        <p
          className="min-h-11 min-w-0 flex-1 break-all rounded-[var(--radius-control)] border border-border bg-[#F0F2F5] px-3 py-2.5 font-medium"
          dir={label === 'الاسم الكامل' ? 'rtl' : 'ltr'}
        >
          {value || '—'}
        </p>
        {value ? (
          <Button type="button" variant="outline" onClick={copy} aria-label={`نسخ ${label}`}>
            {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
            {copied ? 'تم' : 'نسخ'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function unwrapAdmin(res) {
  const root = res?.data;
  return root?.data ?? root;
}

export default function CampAdminModal({
  open,
  onClose,
  onSaved,
  admin = null,
  allowSuper = false,
  campId = null,
}) {
  const isEdit = Boolean(admin?.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    is_super: false,
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    setCredentials(null);
    setForm({
      name: admin?.name || '',
      username: admin?.username || '',
      email: admin?.email || '',
      password: isEdit ? '' : generatePassword(),
      is_super: Boolean(admin?.is_super),
    });
  }, [open, admin, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim() || null,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
      if (allowSuper && !isEdit) {
        payload.is_super = Boolean(form.is_super);
      }
      if (campId && !isEdit) {
        payload.camp_id = campId;
      }
      const res = isEdit
        ? await api.patch(`/admin/users/${admin.id}`, payload)
        : await api.post('/admin/users', payload);
      const saved = unwrapAdmin(res);
      onSaved?.(saved);
      setCredentials({
        name: saved?.name || payload.name,
        username: saved?.username || payload.username,
        password: saved?.plain_password || payload.password || '',
      });
    } catch (err) {
      setError(getApiErrorMessage(err, isEdit ? 'تعذر حفظ بيانات المسؤول.' : 'تعذر إضافة المسؤول.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={credentials ? 'بيانات الدخول' : isEdit ? 'تعديل المسؤول' : 'إضافة مسؤول جديد'}
      className="max-w-md"
    >
      {credentials ? (
        <div className="space-y-4" dir="rtl">
          <Alert variant="success">
            {credentials.password
              ? 'انسخوا الاسم واسم المستخدم وكلمة السر الآن. كلمة السر ما بتظهر بعد إغلاق النافذة.'
              : 'تم حفظ الاسم واسم المستخدم. كلمة السر القديمة ما زالت كما هي.'}
          </Alert>
          <CopyRow label="الاسم الكامل" value={credentials.name} />
          <CopyRow label="اسم المستخدم" value={credentials.username} />
          {credentials.password ? <CopyRow label="كلمة السر" value={credentials.password} /> : null}
          <Button type="button" className="w-full" onClick={onClose}>
            تم
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          <Input
            id="admin-name"
            name="name"
            label="الاسم الكامل"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: أحمد محمد"
          />
          <Input
            id="admin-username"
            name="username"
            label="اسم المستخدم"
            required
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="مثال: ahmed_99"
            dir="ltr"
          />
          <Input
            id="admin-email"
            name="email"
            label="البريد الإلكتروني (اختياري)"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            dir="ltr"
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                {isEdit ? 'كلمة سر جديدة (اختياري)' : 'كلمة السر'}
              </label>
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => setForm((prev) => ({ ...prev, password: generatePassword() }))}
              >
                توليد كلمة سر
              </button>
            </div>
            <Input
              id="admin-password"
              name="password"
              type="text"
              autoComplete="off"
              required={!isEdit}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={isEdit ? 'اتركوها فارغة إذا ما بدكم تغييرها' : ''}
              dir="ltr"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {isEdit
                ? 'إذا عبّيتوا كلمة سر جديدة، رح تظهر بعد الحفظ حتى تنسخوها وتعطوها للمسؤول.'
                : 'كلمة السر ظاهرة حتى تشوفوها وتنسخوها قبل الإضافة.'}
            </p>
          </div>

          {allowSuper && !isEdit ? (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 px-1" htmlFor="is_super">
              <input
                type="checkbox"
                id="is_super"
                checked={form.is_super}
                onChange={(e) => setForm({ ...form, is_super: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">مسؤول فائق</span>
            </label>
          ) : null}

          {error ? <Alert>{error}</Alert> : null}

          <div className="mt-2 flex gap-3">
            <Button type="submit" className="flex-1" loading={loading}>
              {isEdit ? 'حفظ' : 'إضافة'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              إلغاء
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
