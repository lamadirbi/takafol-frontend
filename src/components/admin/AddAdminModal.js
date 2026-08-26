'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';

export default function AddAdminModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    is_super: false,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/users', form);
      setForm({ name: '', username: '', email: '', password: '', is_super: false });
      onCreated();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إضافة المسؤول.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={loading ? undefined : onClose} title="إضافة مسؤول جديد" className="max-w-md">
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
        />
        <Input
          id="admin-email"
          name="email"
          label="البريد الإلكتروني (اختياري)"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          id="admin-password"
          name="password"
          label="كلمة المرور"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label className="flex min-h-11 cursor-pointer items-center gap-2 px-1" htmlFor="is_super">
          <input
            type="checkbox"
            id="is_super"
            checked={form.is_super}
            onChange={(e) => setForm({ ...form, is_super: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-foreground">
            مسؤول فائق (يستطيع إدارة المسؤولين الآخرين)
          </span>
        </label>

        {error ? <Alert>{error}</Alert> : null}

        <div className="mt-6 flex gap-3">
          <Button type="submit" className="flex-1" loading={loading}>
            إضافة
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
