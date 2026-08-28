'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/hooks/useAuth';
import { isGlobalSuperAdmin } from '@/lib/authSession';
import { cn } from '@/lib/utils';
import InstallPwaButton from '@/components/ui/InstallPwaButton';
import {
  IconHome,
  IconMegaphone,
  IconBuilding,
  IconFamily,
  IconShield,
  IconWhatsApp,
  IconClose,
  IconClipboard,
  IconInfo,
  IconChat,
} from '@/components/ui/Icons';

const SUPPORT_WA =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) || '970592533678';

function waDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

function itemClass(active) {
  return cn(
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors',
    active ? 'bg-black/6 font-semibold text-foreground' : 'text-foreground hover:bg-black/5'
  );
}

function IconWell({ children }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground">
      {children}
    </span>
  );
}

export default function PublicNav({ onNavigate, onClose }) {
  const pathname = usePathname();
  const { camp } = useCamp() || {};
  const { familyUser, adminUser } = useAuth();
  const showAllCamps = isGlobalSuperAdmin(adminUser);
  const supportHref = `https://wa.me/${waDigits(SUPPORT_WA)}`;
  const homeHref = camp?.slug ? `/${camp.slug}` : '/';
  const newsHref = camp?.slug ? `/${camp.slug}/news` : '/news';
  const familyLoginHref = camp?.slug ? `/${camp.slug}/login` : null;
  const adminLoginHref = camp?.slug ? `/${camp.slug}/login/admin` : null;

  const aboutHref = camp?.slug ? `/${camp.slug}/about` : '/about';
  const contactHref = camp?.slug ? `/${camp.slug}/contact` : '/contact';
  const isHome = pathname === homeHref || pathname === '/';
  const isNews = pathname === '/news' || pathname?.endsWith('/news');
  const isAbout = pathname === '/about' || pathname === aboutHref;
  const isContact = pathname === '/contact' || pathname === contactHref;

  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-4" dir="rtl">
      {onClose ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="px-2 text-sm font-semibold text-[#65676B]">القائمة</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E4E6EB] text-foreground"
            aria-label="إغلاق القائمة"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col overflow-y-auto" aria-label="القائمة">
        <div className="flex flex-col gap-0.5">
          <Link href={homeHref} onClick={onNavigate} className={itemClass(isHome && !isNews && !isAbout && !isContact)} aria-current={isHome && !isNews && !isAbout && !isContact ? 'page' : undefined}>
            <IconWell>
              <IconHome className="h-5 w-5" />
            </IconWell>
            الرئيسية
          </Link>
          <Link href={aboutHref} onClick={onNavigate} className={itemClass(isAbout)} aria-current={isAbout ? 'page' : undefined}>
            <IconWell>
              <IconInfo className="h-5 w-5" />
            </IconWell>
            من نحن
          </Link>
          <Link href={contactHref} onClick={onNavigate} className={itemClass(isContact)} aria-current={isContact ? 'page' : undefined}>
            <IconWell>
              <IconChat className="h-5 w-5" />
            </IconWell>
            تواصل
          </Link>
          {camp?.slug ? (
            <Link href={newsHref} onClick={onNavigate} className={itemClass(isNews)} aria-current={isNews ? 'page' : undefined}>
              <IconWell>
                <IconMegaphone className="h-5 w-5" />
              </IconWell>
              أخبار المخيم
            </Link>
          ) : null}
          {camp?.slug && showAllCamps ? (
            <Link href="/" onClick={onNavigate} className={itemClass(pathname === '/')}>
              <IconWell>
                <IconBuilding className="h-5 w-5" />
              </IconWell>
              كل المخيمات
            </Link>
          ) : null}
          {familyLoginHref ? (
            familyUser ? (
              <Link href={`/${camp.slug}/family/dashboard`} onClick={onNavigate} className={itemClass(pathname?.includes('/family'))}>
                <IconWell>
                  <IconFamily className="h-5 w-5" />
                </IconWell>
                حسابي
              </Link>
            ) : (
              <Link
                href={familyLoginHref}
                onClick={onNavigate}
                className={itemClass(pathname?.includes('/login') && !pathname?.includes('/admin') && !pathname?.includes('super-admin'))}
              >
                <IconWell>
                  <IconFamily className="h-5 w-5" />
                </IconWell>
                دخول العائلات
              </Link>
            )
          ) : null}
          {adminLoginHref && !familyUser ? (
            adminUser?.camp_id != null ? (
              <Link href={`/${camp.slug}/admin/dashboard`} onClick={onNavigate} className={itemClass(pathname?.includes('/admin') && !pathname?.includes('/login'))}>
                <IconWell>
                  <IconShield className="h-5 w-5" />
                </IconWell>
                لوحة الإدارة
              </Link>
            ) : (
              <Link href={adminLoginHref} onClick={onNavigate} className={itemClass(pathname?.includes('/login/admin'))}>
                <IconWell>
                  <IconShield className="h-5 w-5" />
                </IconWell>
                دخول الإدارة
              </Link>
            )
          ) : null}
          <Link href="/#register" onClick={onNavigate} className={itemClass(false)}>
            <IconWell>
              <IconClipboard className="h-5 w-5" />
            </IconWell>
            تسجيل مخيم جديد
          </Link>
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={cn(itemClass(false), 'text-[#128C7E]')}
          >
            <IconWell>
              <IconWhatsApp className="h-5 w-5 text-[#128C7E]" />
            </IconWell>
            واتساب
          </a>
          <InstallPwaButton variant="nav" className={itemClass(false)} onClick={onNavigate} />
        </div>
      </nav>
    </div>
  );
}
