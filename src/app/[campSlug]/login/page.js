'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/utils';
import { loadFamilyLogin, saveFamilyLogin } from '@/lib/loginPrefs';

export default function FamilyLoginPage() {
  const router = useRouter();
  const { campSlug } = useParams();
  const { camp, loading: campLoading } = useCamp();
  const { login } = useAuth();
  const [subscriptionReason, setSubscriptionReason] = useState(false);
  const portalLocked = Boolean(camp?.families_portal_locked);

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 p-4" dir="rtl">
      <Card className="w-full max-w-md overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <div className="relative flex h-32 items-center justify-center bg-primary">
          {camp?.logo_path ? (
            <Image
              src={camp.logo_path}
              alt={camp.name}
              width={80}
              height={80}
              className="rounded-full bg-white p-2 shadow-lg"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
              <span className="text-2xl font-bold text-primary">تَكافل</span>
            </div>
          )}
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-center text-2xl font-bold text-slate-900">دخول العائلات (رب الأسرة)</h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            رقم الهوية والرقم الذي حصلت عليه من إدارة المخيم. دخول اللجنة من صفحة منفصلة.
          </p>

          {subscriptionReason ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-950">
              انتهى اشتراك المخيم أو لم يُجدَّد بعد. لا يمكن الدخول حتى يُحدَّث من إدارة المنصة أو إدارة المخيم.
            </p>
          ) : null}

          {campLoading ? (
            <div className="mt-8 flex justify-center py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : null}

          {!campLoading && portalLocked ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
              <p className="font-semibold">دخول العائلات غير متاح حالياً</p>
              <p className="mt-1 text-amber-900/90">
                اشتراك المخيم في المنصة غير مفعّل أو انتهت فترة التجديد الشهرية. راجع إدارة المخيم أو تواصل مع
                منصة تَكافل لاستكمال الدفع.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">رقم الهوية</label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="أدخل رقم الهوية"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                required
                disabled={portalLocked || campLoading}
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">الرقم من إدارة المخيم</label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="مثال: 009"
                value={serial}
                onChange={(e) => setSerial(e.target.value.replace(/\D/g, '').slice(0, 3))}
                required
                disabled={portalLocked || campLoading}
                className="mt-2 rounded-xl font-mono"
              />
              <p className="mt-1 text-xs text-slate-500">3 أرقام (يُكمَّل بالأصفار إن لزم، مثل 009).</p>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={portalLocked || campLoading}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary"
              />
              <span>تذكر بيانات الدخول على هذا الجهاز لحفظ رقم الهوية والرقم محلياً (دون كلمة مرور منفصلة).</span>
            </label>

            {error ? (
              <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading || portalLocked || campLoading}
              className="w-full rounded-xl py-6 text-lg shadow-lg shadow-primary/20"
            >
              {loading ? 'جاري الدخول…' : portalLocked ? 'الدخول معطّل' : 'دخول'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-500">خاص بإدارة المخيم؟</p>
            <Link
              href={`/${campSlug}/login/admin`}
              className="mt-1 inline-block font-bold text-primary hover:underline"
            >
              لوحة إدارة المخيم
            </Link>
          </div>
        </div>
      </Card>

      <Link href={`/${campSlug}`} className="mt-8 text-sm text-slate-400 transition-colors hover:text-primary">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
