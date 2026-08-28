'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { campLogoSrc, DEFAULT_BRAND_LOGO } from '@/lib/brand';
import { getApiErrorMessage } from '@/lib/utils';
import { useCamp } from '@/context/CampContext';

const MAX_LOGO_MB = 5;

export default function CampLogoForm() {
  const { camp, refreshCamp } = useCamp() || {};
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const currentSrc = campLogoSrc(camp);
  const hasCustomLogo = Boolean(camp?.logo_url || camp?.logo_path);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('اختر ملف صورة (JPG أو PNG أو WebP).');
      return;
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      setError(`حجم الصورة أكبر من ${MAX_LOGO_MB} ميغابايت.`);
      return;
    }

    setError('');
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      await api.post('/admin/camp/logo', fd);
      await refreshCamp?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر رفع الشعار.'));
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      setPreview('');
    }
  }

  async function removeLogo() {
    setError('');
    setRemoving(true);
    try {
      await api.delete('/admin/camp/logo');
      await refreshCamp?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حذف الشعار.'));
    } finally {
      setRemoving(false);
    }
  }

  const displaySrc = preview || currentSrc || DEFAULT_BRAND_LOGO;

  return (
    <section className="mb-5 rounded-xl bg-white p-4 shadow-sm" dir="rtl">
      <h2 className="text-sm font-semibold text-foreground">شعار المخيم</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        يظهر في صفحة المخيم، شريط الموقع، وصفحة الدخول. JPG أو PNG أو WebP حتى {MAX_LOGO_MB} ميغابايت.
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-[#F0F2F5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySrc} alt={camp?.name || 'شعار المخيم'} className="h-full w-full object-contain p-1.5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-primary px-4 text-sm font-medium text-white hover:bg-(--carbon-deep) sm:w-auto">
              {uploading ? 'جاري الرفع…' : hasCustomLogo ? 'تغيير الشعار' : 'رفع شعار'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || removing}
                onChange={onFileChange}
              />
            </label>
            {hasCustomLogo ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={uploading || removing}
                loading={removing}
                onClick={removeLogo}
              >
                حذف الشعار
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasCustomLogo ? 'يُستخدم الشعار المرفوع في صفحة المخيم للعائلات والزوار.' : 'حالياً يظهر شعار المنصة الافتراضي حتى ترفع شعاراً خاصاً.'}
          </p>
        </div>
      </div>
      {error ? (
        <Alert className="mt-3" variant="error">
          {error}
        </Alert>
      ) : null}
    </section>
  );
}
