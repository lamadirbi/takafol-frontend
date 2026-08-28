'use client';

import Link from 'next/link';
import SuperAdminShell from '@/components/super-admin/SuperAdminShell';
import InstantNotificationsCard from '@/components/family/InstantNotificationsCard';
import { IconBuilding, IconClipboard, IconMegaphone, IconChat, IconInfo } from '@/components/ui/Icons';
import PageGuidePanel from '@/components/guide/PageGuidePanel';
import { SUPER_ADMIN_GUIDE_HREF, superAdminGuideSections } from '@/components/guide/superAdminGuide';

const SECTIONS = [
  {
    href: '/super-admin/guide',
    title: 'دليل الاستخدام',
    desc: 'خطوات كل قسم في إدارة المنصة.',
    icon: IconInfo,
  },
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
    href: '/super-admin/contact',
    title: 'رسائل التواصل',
    desc: 'استفسارات وطلبات تعديل المنصة من المستخدمين.',
    icon: IconChat,
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
      <PageGuidePanel
        sections={superAdminGuideSections()}
        sectionId="hub"
        guideHref={SUPER_ADMIN_GUIDE_HREF}
      />
      <InstantNotificationsCard
        title="إشعارات المنصة"
        description="اربط تطبيق ntfy حتى يوصلك إشعار عند طلب تسجيل مخيم، رسالة تواصل، تجديد اشتراك، أو قرب انتهاء الاشتراك."
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
