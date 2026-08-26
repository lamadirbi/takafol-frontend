'use client';

import Link from 'next/link';
import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import InstantNotificationsCard from '@/components/family/InstantNotificationsCard';
import { IconBuilding, IconClipboard, IconMegaphone } from '@/components/ui/Icons';

const SECTIONS = [
  {
    href: '/super-admin/camps',
    title: 'المخيمات',
    desc: 'عرض المخيمات، المسارات، المسؤولين والاشتراك.',
    icon: IconBuilding,
  },
  {
    href: '/super-admin/requests',
    title: 'طلبات تسجيل مخيمات',
    desc: 'مراجعة طلبات الانضمام واعتمادها أو رفضها.',
    icon: IconClipboard,
  },
  {
    href: '/super-admin/renewals',
    title: 'تجديد الاشتراك',
    desc: 'إشعارات الدفع وطلبات تجديد اشتراك المخيمات.',
    icon: IconMegaphone,
  },
];

export default function SuperAdminHomePage() {
  return (
    <SuperAdminShell title="إدارة المنصة" description="اختر قسماً للمتابعة">
      <InstantNotificationsCard
        title="إشعارات المنصة"
        description="اربط تطبيق ntfy حتى يوصلك إشعار عند طلب تسجيل مخيم جديد أو طلب تجديد اشتراك."
      />
      <div className="mt-4 space-y-3">
        {SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="file-spine flex min-h-16 items-start gap-3 border border-border bg-card px-4 py-4 transition-colors duration-(--duration-ui) hover:bg-muted/50"
            >
              <Icon className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </SuperAdminShell>
  );
}
