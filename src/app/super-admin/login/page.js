'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getApiErrorMessage } from '@/lib/utils';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { adminLogin, adminUser, adminLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => Boolean(username.trim()) && Boolean(password) && !loading, [username, password, loading]);

  useEffect(() => {
    if (adminLoading) return;
    if (adminUser?.is_super && adminUser.camp_id == null) {
      router.replace('/super-admin');
    }
  }, [adminLoading, adminUser, router]);

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F0F2F5] px-4 py-10 font-sans" dir="rtl">
      <div className="w-full max-w-md rounded-xl bg-white px-6 py-7 shadow-md md:px-8">
        <p className="text-xs font-bold text-primary">منصة تَكافل</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight">دخول الإدارة العليا</h1>
        <p className="mt-1 text-sm text-[#65676B]">خاص بتأسيس وإدارة المخيمات والاشتراكات</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <Input
            type="text"
            label="اسم المستخدم"
            placeholder="أدخل اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            dir="ltr"
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">كلمة المرور</span>
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="min-h-11 text-xs font-medium text-muted-foreground hover:text-foreground"
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
              autoComplete="current-password"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="border border-destructive/30 bg-(--stamp-fill) p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            loading={loading}
            className="w-full rounded-lg"
            size="lg"
          >
            تسجيل الدخول
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            هذه الصفحة مخصصة لـ <span className="font-medium text-foreground">Super Admin العام</span> فقط.
          </p>
        </form>
      </div>

      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-foreground">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
