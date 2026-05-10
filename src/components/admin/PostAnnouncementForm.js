'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';

/**
 * نموذج مبسّط لنشر إعلان (JSON فقط — بدون صورة).
 */
export default function PostAnnouncementForm({ onPosted }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) {
      setError('عنوان المحتوى والنص مطلوبان.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/announcements', {
        title: t,
        content: c,
        published_at: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
      onPosted?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر نشر الإعلان.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm"
      dir="rtl"
    >
      <h2 className="text-lg font-bold text-slate-900">نشر إعلان جديد</h2>
      <p className="mt-1 text-sm text-slate-500">يظهر للعائلات في صفحة الأخبار فور النشر.</p>
      <div className="mt-4 space-y-4">
        <Input
          label="عنوان الإعلان"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: موعد توزيع الطرود"
          className="rounded-xl"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">نص الإعلان</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="تفاصيل التنبيه أو الخبر…"
          />
        </div>
        {error ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <Button type="submit" disabled={loading} className="rounded-xl">
          {loading ? 'جاري النشر…' : 'نشر'}
        </Button>
      </div>
    </form>
  );
}
