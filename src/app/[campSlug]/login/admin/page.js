'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BackButton from '@/components/ui/BackButton';
import { getApiErrorMessage } from '@/lib/utils';
import { loadAdminUsername, saveAdminUsername } from '@/lib/loginPrefs';

export default function AdminLoginPage() {
  const router = useRouter();
  const { campSlug } = useParams() || {};
  const { adminLogin, adminUser, adminLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = loadAdminUsername();
    if (u) setUsername(u);
  }, []);

  useEffect(() => {
    if (adminLoading) return;
    if (adminUser?.camp_id != null) {
      router.replace(`/${campSlug}/admin/dashboard`);
    } else if (adminUser?.is_super) {
      router.replace('/super-admin');
    }
  }, [adminLoading, adminUser, campSlug, router]);

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F0F2F5] px-4 py-10" dir="rtl">
      <div className="mb-4 w-full max-w-md">
        <BackButton fallbackHref={campSlug ? `/${campSlug}` : '/'} />
      </div>

      <div className="w-full max-w-md rounded-xl bg-white px-6 py-7 shadow-md md:px-8">
        <p className="text-xs font-bold text-primary">تَكافل</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground">
          دخول الإدارة
        </h1>
        <p className="mt-1 text-sm text-[#65676B]">
          اسم المستخدم وكلمة المرور المعتمدة للمسؤولين فقط.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-5" noValidate>
          <Input
            id="admin-username"
            name="username"
            label="اسم المستخدم"
            type="text"
            autoComplete="username"
            placeholder="أدخل اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            id="admin-password"
            name="password"
            label="كلمة المرور"
            type="password"
            autoComplete="current-password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={rememberUser}
              onChange={(e) => setRememberUser(e.target.checked)}
              className="mt-1 h-4 w-4 rounded-[2px] border-border text-primary"
            />
            <span>تذكر اسم المستخدم على هذا الجهاز.</span>
          </label>

          {error ? (
            <p className="border border-destructive/30 bg-(--stamp-fill) p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} loading={loading} variant="primary" size="lg" className="w-full rounded-lg">
            دخول الإدارة
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-sm">
          <Link href={`/${campSlug}/login`} className="font-medium text-muted-foreground hover:text-foreground">
            دخول العائلات من صفحة العائلات
          </Link>
        </div>
      </div>

      <Link href={`/${campSlug}`} className="mt-8 text-sm text-muted-foreground hover:text-foreground">
        العودة للرئيسية
      </Link>
    </div>
  );
}
