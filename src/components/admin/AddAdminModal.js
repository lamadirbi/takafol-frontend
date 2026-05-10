'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" dir="rtl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">إضافة مسؤول جديد</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: أحمد محمد"
          />
          <Input
            label="اسم المستخدم"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="مثال: ahmed_99"
          />
          <Input
            label="البريد الإلكتروني (اختياري)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="كلمة المرور"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="is_super"
              checked={form.is_super}
              onChange={(e) => setForm({ ...form, is_super: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_super" className="text-sm font-medium text-slate-700">
              مسؤول فائق (يستطيع إدارة المسؤولين الآخرين)
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
      </div>
    </div>
  );
}
