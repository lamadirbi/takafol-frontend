'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function AdminMobileNav() {
  const pathname = usePathname();
  const { campSlug } = useParams();
  const { user, logout } = useAuth();

  const base = campSlug ? `/${campSlug}` : '';

  const links = [
    { href: `${base}/admin/dashboard`, label: 'الرئيسية' },
    { href: `${base}/admin/filter`, label: 'فلترة' },
    { href: `${base}/admin/families`, label: 'العائلات' },
    { href: `${base}/admin/camp-records`, label: 'السجلات' },
    { href: `${base}/admin/change-requests`, label: 'طلبات التعديل' },
    { href: `${base}/news`, label: 'الأخبار' },
  ];

  if (user?.role === 'admin') {
    links.push({ href: `${base}/admin/admins`, label: 'المسؤولين' });
  }

  const adminLoginPath = campSlug ? `/${campSlug}/login/admin` : '/login';

  return (
    <nav
      className="sticky top-0 z-30 flex min-h-12 items-center gap-1 overflow-x-auto border-b border-white/15 bg-[color:var(--header-bar)] px-3 py-2 md:hidden"
      aria-label="تنقل سريع — الإدارة"
      dir="rtl"
    >
      {links.map((l) => {
        const isNews = l.href === `${base}/news`;
        const active = isNews
          ? pathname === l.href || pathname?.endsWith('/news')
          : pathname === l.href || pathname?.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition',
              active ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/10'
            )}
          >
            {l.label}
          </Link>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="ms-1 shrink-0 border-white/40 bg-white/10 text-xs text-white hover:bg-white/15"
        onClick={() => logout(adminLoginPath)}
      >
        خروج
      </Button>
    </nav>
  );
}
