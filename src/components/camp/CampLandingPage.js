'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import FeaturedNewsSection from '@/components/home/FeaturedNewsSection';
import HomePillarsStrip from '@/components/home/HomePillarsStrip';
import { useCamp } from '@/context/CampContext';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';

const PAYMENT_METHODS = [
  {
    method: 'محفظة بال باي',
    number: '0592533678',
    name: 'لما أحمد الدربي',
  },
  {
    method: 'بنك فلسطين',
    number: '0592377078',
    name: 'اسماعيل أسامة عبد العال',
  },
];

export default function CampLandingPage() {
  const { camp, loading } = useCamp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">المخيم غير موجود</h1>
        <p className="mt-2 text-slate-600">يرجى التأكد من الرابط الصحيح للمخيم.</p>
        <Link href="/" className="mt-4 text-primary underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const landingData = camp.landing_page_data || {};

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6">
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:ring-slate-200" />
          <div className="flex flex-wrap items-center gap-2" dir="rtl">
            <Link
              href={`/${camp.slug}/login/admin`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              دخول الإدارة
            </Link>
            <Link
              href={`/${camp.slug}/login`}
              className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white hover:opacity-95"
            >
              دخول العائلات
            </Link>
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary">
              الصفحة العامة
            </Link>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:py-20">
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50">
            <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-8 md:p-16" dir="rtl">
                    <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                        <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        {camp.name} — تَكافل
                    </div>
                    <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
                        {landingData.hero_title || `مرحباً بك في ${camp.name}`}
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-slate-600 md:text-xl">
                        {landingData.hero_description || "نعمل معاً لتنظيم المساعدات بكرامة وشفافية… كرامة، شفافية، وأمل."}
                    </p>
                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link href={`/${camp.slug}/login`}>
                            <Button size="xl" className="rounded-2xl px-10 py-6 text-lg shadow-lg shadow-primary/20">
                                تسجيل الدخول للعائلات
                            </Button>
                        </Link>
                        <Link href={`/${camp.slug}/news`}>
                            <Button variant="outline" size="xl" className="rounded-2xl border-2 px-10 py-6 text-lg">
                                أخبار المخيم
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="relative min-h-[400px] lg:min-h-full">
                    <Image
                        src={camp.logo_path || DEFAULT_BRAND_LOGO}
                        alt={camp.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-white via-white/20 to-transparent lg:block hidden"></div>
                </div>
            </div>
        </section>

        {/* Quick Actions / Stats */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" dir="rtl">
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-primary group-hover:text-white">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">تنظيم وتوزيع</h3>
                <p className="mt-3 text-slate-600">نظام متكامل لتوزيع الطرود الغذائية والتعليمية بعدالة وشفافية تامة.</p>
            </div>
            
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors group-hover:bg-primary group-hover:text-white">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">العائلات والأفراد</h3>
                <p className="mt-3 text-slate-600">سجل عائلي شامل لكل أسرة يضمن وصول المساعدات لكل فرد مستحق.</p>
            </div>

            <div className="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-primary group-hover:text-white">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">تواصل مباشر</h3>
                <p className="mt-3 text-slate-600">متابعة لحظية للإعلانات والتنبيهات، وإرسال طلبات التعديل بسهولة.</p>
            </div>
        </div>

        <div className="mt-20">
            <FeaturedNewsSection />
        </div>

        <div className="mt-20" dir="rtl">
            <h2 className="text-3xl font-bold text-slate-900">ركائز العمل في {camp.name}</h2>
            <div className="mt-8">
                <HomePillarsStrip />
            </div>
        </div>

        <section className="mt-20 rounded-4xl border border-amber-200 bg-amber-50/70 p-8" dir="rtl">
          <h2 className="text-2xl font-bold text-amber-950">وسائل الدفع</h2>
          <p className="mt-2 text-sm text-amber-900">لإرسال إشعار الدفع استخدم إحدى الطرق التالية:</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {PAYMENT_METHODS.map((item) => (
              <div key={item.method} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm">
                <p className="font-bold text-slate-900">{item.method}</p>
                <p className="mt-1 text-slate-700" dir="ltr">
                  {item.number}
                </p>
                <p className="mt-1 text-slate-600">الاسم: {item.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Improved Call to Action */}
        <section className="mt-32 rounded-[3rem] bg-slate-900 p-12 text-center text-white" dir="rtl">
            <h2 className="text-3xl font-bold md:text-4xl">هل أنت مسؤول في إدارة المخيم؟</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
                يمكنك الدخول إلى لوحة التحكم لإدارة العائلات، تنظيم التوزيعات، ونشر الأخبار العاجلة للمخيم.
            </p>
            <div className="mt-10">
                <Link href={`/${camp.slug}/login/admin`}>
                    <Button size="xl" variant="secondary" className="rounded-2xl px-12 py-6 text-lg">
                        دخول بوابة الإدارة
                    </Button>
                </Link>
            </div>
        </section>
      </main>
    </div>
  );
}
