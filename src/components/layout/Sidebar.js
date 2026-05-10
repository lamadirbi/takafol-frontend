'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function Sidebar() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const { user, logout } = useAuth();

  const base = campSlug ? `/${campSlug}` : '';

  const items = [
    { href: `${base}/admin/dashboard`, label: 'الرئيسية', icon: '🏠', match: 'prefix' },
    {
      href: `${base}/admin/filter`,
      label: 'فلترة عائلات / أفراد',
      icon: '🔍',
      match: 'exact',
    },
    {
      href: `${base}/admin/families`,
      label: 'سجل العائلات',
      icon: '👨‍👩‍👧',
      match: 'prefix',
    },
    {
      href: `${base}/admin/camp-records`,
      label: 'سجلات الفلترة',
      icon: '📂',
      match: 'exact',
    },
    {
      href: `${base}/admin/change-requests`,
      label: 'طلبات تعديل البيانات',
      icon: '📝',
      match: 'exact',
    },
    { href: `${base}/news`, label: 'إدارة الأخبار', icon: '📣', match: 'exact' },
  ];

  if (user?.role === 'admin') {
    items.push({
      href: `${base}/admin/admins`,
      label: 'إدارة المسؤولين',
      icon: '🔐',
      match: 'prefix',
    });
  }

  function isActive(item) {
    if (!pathname) return false;
    if (item.match === 'exact') return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const adminLoginPath = campSlug ? `/${campSlug}/login/admin` : '/login';

  return (
    <aside className="hidden min-h-dvh w-56 shrink-0 border-e border-white/15 bg-[color:var(--header-bar)] md:flex md:flex-col">
      <div className="border-b border-white/15 px-3 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-white/70">تَكافل</p>
        <p className="mt-0.5 text-sm font-semibold text-white">لوحة الإدارة</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3" dir="rtl">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition',
                active
                  ? 'bg-white/15 font-semibold text-white'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              )}
            >
              <span aria-hidden>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/15 px-2 py-3" dir="rtl">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-white/40 bg-white/10 text-white hover:bg-white/15"
          onClick={() => logout(adminLoginPath)}
        >
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
