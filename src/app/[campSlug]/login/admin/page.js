'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import BackButton from '@/components/ui/BackButton';
import { useCamp } from '@/context/CampContext';
import { getApiErrorMessage } from '@/lib/utils';
import { loadAdminUsername, saveAdminUsername } from '@/lib/loginPrefs';

export default function AdminLoginPage() {
  const router = useRouter();
  const { campSlug } = useParams() || {};
  const { camp } = useCamp();
  const { adminLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = loadAdminUsername();
    if (u) setUsername(u);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminLogin(username, password);
      if (rememberUser) saveAdminUsername(username);
      else saveAdminUsername('');
      router.push(`/${campSlug}/admin/dashboard`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'فشل دخول الإدارة. يرجى التحقق من الصلاحيات.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-900 p-4" dir="rtl">
      <Card className="w-full max-w-md overflow-hidden rounded-4xl border-none bg-white shadow-2xl">
        <div className="relative flex h-32 items-center justify-center bg-slate-800">
          <div className="absolute left-4 top-4">
            <BackButton fallbackHref={campSlug ? `/${campSlug}` : '/'} className="border-white/20 bg-white/10" />
          </div>
          <div className="absolute right-4 top-4 rounded border border-slate-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
            Admin
          </div>
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
              <span className="text-2xl font-bold text-slate-800">تَكافل</span>
            </div>
          )}
        </div>

        <div className="p-8 md:p-10">
          <h1 className="text-center text-2xl font-bold text-slate-900">لوحة إدارة المخيم</h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            دخول منفصل عن العائلات: اسم المستخدم وكلمة المرور المعتمدة للمسؤولين فقط.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">اسم المستخدم</label>
              <Input
                type="text"
                autoComplete="username"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 rounded-xl border-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">كلمة المرور</label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 rounded-xl border-slate-200"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberUser}
                onChange={(e) => setRememberUser(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary"
              />
              <span>تذكر اسم المستخدم على هذا الجهاز (لا نخزن كلمة المرور لأسباب أمنية).</span>
            </label>

            {error ? (
              <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full rounded-xl bg-slate-900 py-6 text-lg hover:bg-slate-800"
            >
              {loading ? 'جاري الدخول…' : 'دخول الإدارة'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <Link href={`/${campSlug}/login`} className="font-bold text-slate-500 transition-colors hover:text-primary">
              دخول العائلات (هوية + الرقم من إدارة المخيم) من صفحة العائلات
            </Link>
          </div>
        </div>
      </Card>

      <Link href={`/${campSlug}`} className="mt-8 text-sm text-slate-500 transition-colors hover:text-white">
        العودة للرئيسية
      </Link>
    </div>
  );
}
