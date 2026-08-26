'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/utils';
import { loadFamilyLogin, saveFamilyLogin } from '@/lib/loginPrefs';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';

export default function FamilyLoginPage() {
  const router = useRouter();
  const { campSlug } = useParams();
  const { camp, loading: campLoading } = useCamp();
  const { login, familyUser, familyLoading } = useAuth();
  const [subscriptionReason, setSubscriptionReason] = useState(false);
  const portalLocked = Boolean(camp?.families_portal_locked);

  useEffect(() => {
    if (familyLoading) return;
    if (familyUser) {
      router.replace(`/${campSlug}/family/dashboard`);
    }
  }, [familyLoading, familyUser, campSlug, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('reason');
    setSubscriptionReason(q === 'subscription');
  }, []);

  const [nationalId, setNationalId] = useState('');
  const [serial, setSerial] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = loadFamilyLogin();
    if (saved) {
      setNationalId(saved.nationalId);
      setSerial(saved.serial);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (portalLocked) return;
    setLoading(true);
    setError('');

    const serialDigits = String(serial ?? '')
      .replace(/\D/g, '')
      .slice(0, 3)
      .padStart(3, '0');

    try {
      await login(String(nationalId ?? '').trim(), serialDigits);
      saveFamilyLogin(nationalId, serialDigits, remember);
      router.push(`/${campSlug}/family/dashboard`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'فشل تسجيل الدخول. يرجى التحقق من البيانات.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F0F2F5] px-4 py-10" dir="rtl">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm">
          <Image
            src={camp?.logo_path || DEFAULT_BRAND_LOGO}
            alt={camp?.name || 'تَكافل'}
            width={64}
            height={64}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <p className="text-3xl font-bold text-primary">تَكافل</p>
        <p className="mt-1 text-sm text-[#65676B]">{camp?.name || 'دخول العائلات'}</p>
      </div>

      <div className="w-full max-w-md rounded-xl bg-white px-6 py-7 shadow-md md:px-8">
        <h1 className="text-xl font-bold text-foreground">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-[#65676B]">
          رقم الهوية والرقم الصادر من إدارة المخيم.
        </p>

        {subscriptionReason ? (
          <p className="mt-4 border border-warn/30 bg-(--warn-fill) px-3 py-2 text-sm text-warn" role="status">
            انتهى اشتراك المخيم أو لم يُجدَّد بعد. لا يمكن الدخول حتى يُحدَّث من إدارة المنصة أو إدارة المخيم.
          </p>
        ) : null}

        {campLoading ? (
          <div className="mt-8 flex justify-center py-6">
            <Spinner className="h-8 w-8 text-primary" label="جاري التحميل" />
          </div>
        ) : null}

        {!campLoading && portalLocked ? (
          <div className="mt-6 border border-warn/30 bg-(--warn-fill) px-4 py-3 text-sm text-warn" role="status">
            <p className="font-medium">دخول العائلات غير متاح حالياً</p>
            <p className="mt-1 text-muted-foreground">
              اشتراك المخيم غير مفعّل أو انتهت فترة التجديد. راجع إدارة المخيم.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="mt-6 space-y-5" noValidate>
          <Input
            id="nationalId"
            name="nationalId"
            label="رقم الهوية"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="أدخل رقم الهوية"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            required
            disabled={portalLocked || campLoading}
          />

          <Input
            id="serial"
            name="serial"
            label="الرقم من إدارة المخيم"
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder="مثال: 009"
            value={serial}
            onChange={(e) => setSerial(e.target.value.replace(/\D/g, '').slice(0, 3))}
            required
            disabled={portalLocked || campLoading}
            inputClassName="font-mono tabular-nums"
            hint="3 أرقام (يُكمَّل بالأصفار إن لزم، مثل 009)."
          />

          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={portalLocked || campLoading}
              className="mt-1 h-4 w-4 rounded-[2px] border-border text-primary"
            />
            <span>تذكر بيانات الدخول على هذا الجهاز.</span>
          </label>

          {error ? (
            <p className="border border-destructive/30 bg-(--stamp-fill) p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={loading || portalLocked || campLoading}
            loading={loading}
            className="w-full rounded-lg"
            size="lg"
          >
            {portalLocked ? 'الدخول معطّل' : 'دخول'}
          </Button>
        </form>
      </div>

      <Link href={`/${campSlug}`} className="mt-8 inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
