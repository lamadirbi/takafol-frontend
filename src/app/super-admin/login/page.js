'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { getApiErrorMessage } from '@/lib/utils';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => Boolean(username.trim()) && Boolean(password) && !loading, [username, password, loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await adminLogin(username, password);
      
      if (!user.is_super || user.camp_id != null) {
        setError('هذا الحساب ليس سوبر أدمن عام لإدارة المنصة.');
        setLoading(false);
        return;
      }

      router.replace('/super-admin');
    } catch (err) {
      console.error('Login failed:', err);
      setError(getApiErrorMessage(err, 'فشل تسجيل الدخول. يرجى التحقق من البيانات.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center bg-slate-50 p-4 font-sans"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-20%,rgba(59,130,246,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b from-white to-transparent" />

      <Card className="relative w-full max-w-md overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl">
        <div className="p-8 md:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200">
            <Image
              src={DEFAULT_BRAND_LOGO}
              alt="تَكافل"
              width={72}
              height={72}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h1 className="text-center text-2xl font-extrabold text-slate-900">بوابة الإدارة العليا</h1>
          <p className="mt-2 text-center text-sm text-slate-600">خاص بتأسيس وإدارة المخيمات والاشتراكات</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">اسم المستخدم</label>
              <Input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2"
                inputClassName="bg-white"
                autoComplete="username"
                dir="ltr"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-sm font-semibold text-slate-700">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-xs font-semibold text-slate-600 hover:text-primary"
                >
                  {showPass ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2"
                inputClassName="bg-white"
                autoComplete="current-password"
                dir="ltr"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm font-medium text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              loading={loading}
              className="w-full rounded-2xl py-6 text-lg disabled:opacity-60"
            >
              تسجيل الدخول
            </Button>

            <p className="text-center text-xs text-slate-500">
              هذه الصفحة مخصصة لـ <span className="font-semibold text-slate-800">Super Admin العام</span> فقط.
            </p>
          </form>
        </div>
      </Card>
      
      <Link href="/" className="mt-8 text-sm text-slate-500 transition-colors hover:text-primary">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
