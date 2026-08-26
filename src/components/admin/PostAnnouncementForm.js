'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';

const MAX_IMAGE_MB = 5;

/**
 * نشر إعلان (نص اختياري مع صورة).
 */
export default function PostAnnouncementForm({ onPosted }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function onImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('اختر ملف صورة (JPG أو PNG أو WebP).');
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`حجم الصورة أكبر من ${MAX_IMAGE_MB} ميغابايت.`);
      return;
    }
    setError('');
    setImageFile(file);
  }

  function clearImage() {
    setImageFile(null);
  }

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
      const fd = new FormData();
      fd.append('title', t);
      fd.append('content', c);
      fd.append('published_at', new Date().toISOString());
      if (imageFile) fd.append('image', imageFile);
      await api.post('/admin/announcements', fd);
      setTitle('');
      setContent('');
      setImageFile(null);
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
      className="rounded-xl bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <h2 className="text-lg font-bold text-foreground">نشر إعلان جديد</h2>
      <p className="mt-1 text-sm text-muted-foreground">يظهر للعائلات في صفحة الأخبار فور النشر.</p>
      <div className="mt-4 space-y-4">
        <Input
          id="announcement-title"
          label="عنوان الإعلان"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: موعد توزيع الطرود"
        />
        <Textarea
          id="announcement-content"
          label="نص الإعلان"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="تفاصيل التنبيه أو الخبر…"
        />

        <div>
          <p className="text-sm font-medium text-foreground">صورة المنشور (اختياري)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG أو PNG أو WebP، حتى {MAX_IMAGE_MB} ميغابايت.
          </p>
          {imagePreview ? (
            <div className="mt-3 overflow-hidden rounded-[var(--radius-control)] border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="معاينة الصورة" className="max-h-56 w-full object-cover" />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-2">
                <p className="min-w-0 truncate text-xs text-muted-foreground">{imageFile?.name}</p>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  إزالة الصورة
                </button>
              </div>
            </div>
          ) : (
            <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-control)] border border-border px-4 text-sm font-medium hover:bg-muted">
              اختيار صورة
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading}
                onChange={onImageChange}
              />
            </label>
          )}
        </div>

        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" loading={loading} disabled={loading}>
          نشر
        </Button>
      </div>
    </form>
  );
}
