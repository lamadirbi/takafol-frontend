'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import FeaturedNewsSection from '@/components/home/FeaturedNewsSection';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';
import { IconBuilding, IconUsers, IconChat, IconChevron } from '@/components/ui/Icons';

const FEATURES = [
  {
    title: 'تنظيم وتوزيع',
    desc: 'نظام متكامل لتوزيع الطرود الغذائية والتعليمية بعدالة وشفافية تامة.',
    icon: IconBuilding,
  },
  {
    title: 'العائلات والأفراد',
    desc: 'سجل عائلي شامل لكل أسرة يضمن وصول المساعدات لكل فرد مستحق.',
    icon: IconUsers,
  },
  {
    title: 'تواصل مباشر',
    desc: 'متابعة لحظية للإعلانات والتنبيهات، وإرسال طلبات التعديل بسهولة.',
    icon: IconChat,
  },
];

function AboutCampBlock({ className = '' }) {
  return (
    <details className={`group overflow-hidden rounded-lg ${className}`.trim()}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 bg-[#E4E6EB] px-5 text-[length:var(--text-h4)] font-medium hover:bg-[#d8dadf] group-open:rounded-b-none group-open:bg-white group-open:shadow-sm [&::-webkit-details-marker]:hidden">
        عن المخيم
        <IconChevron className="h-5 w-5 shrink-0 -rotate-90 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      <div className="divide-y divide-black/8 border-t border-black/8 bg-white shadow-sm">
        {FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 px-4 py-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

export default function CampLandingPage({ compact = false }) {
  const { camp, loading } = useCamp();
  const { familyUser, adminUser } = useAuth();

  if (loading && !camp) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background py-16">
        <Spinner className="h-10 w-10 text-primary" label="جاري التحميل" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">المخيم غير موجود</h1>
        <p className="mt-2 text-muted-foreground">يرجى التأكد من الرابط الصحيح للمخيم.</p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-primary underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const landingData = camp.landing_page_data || {};

  return (
    <div className={compact ? 'flex flex-1 flex-col' : 'flex flex-1 flex-col bg-background'}>
      <main
        className={
          compact
            ? 'flex w-full flex-1 flex-col'
            : 'mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8'
        }
        dir="rtl"
      >
        <div className={compact ? 'rounded-xl bg-white p-4 shadow-sm' : ''}>
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-[var(--radius-control)] border border-border bg-card">
            <Image
              src={camp.logo_path || DEFAULT_BRAND_LOGO}
              alt={camp.name}
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div>
            <p className="text-[length:var(--text-caption)] tracking-[0.16em] text-muted-foreground">تَكافل</p>
            <h1 className="text-[length:var(--text-h2)] font-semibold tracking-tight">
              {landingData.hero_title || camp.name}
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {landingData.hero_description || 'سجل العائلات وتوزيع الطرود بين اللجنة والأسر.'}
        </p>
        </div>

        {compact ? null : (
        <div className="mt-8 flex flex-col gap-2">
          {familyUser ? (
            <Link href={`/${camp.slug}/family/dashboard`} className="block">
              <Button size="lg" className="w-full">
                حسابي
              </Button>
            </Link>
          ) : (
            <Link href={`/${camp.slug}/login`} className="block">
              <Button size="lg" className="w-full">
                دخول العائلات
              </Button>
            </Link>
          )}
          {adminUser?.camp_id != null ? (
            <Link href={`/${camp.slug}/admin/dashboard`} className="block">
              <Button variant="outline" size="lg" className="w-full">
                لوحة الإدارة
              </Button>
            </Link>
          ) : (
            <Link href={`/${camp.slug}/login/admin`} className="block">
              <Button variant="outline" size="lg" className="w-full">
                دخول الإدارة
              </Button>
            </Link>
          )}
          <Link href={`/${camp.slug}/news`} className="block">
            <Button variant="outline" size="lg" className="w-full">
              أخبار المخيم
            </Button>
          </Link>
          <AboutCampBlock />
        </div>
        )}

        {compact ? <AboutCampBlock className="mt-4" /> : null}

        <div className="mt-10">
          <FeaturedNewsSection />
        </div>
      </main>
    </div>
  );
}
