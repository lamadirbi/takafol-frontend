'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/ui/LogoutButton';

function initials(name) {
  const s = String(name || '').trim();
  return s ? s.slice(0, 1) : 'أ';
}

export default function AccountMenu({
  name,
  onLogout,
  profileHref,
  profileLabel = 'حسابي',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
        aria-label="الحساب"
        aria-expanded={open}
      >
        {initials(name)}
      </button>
      {open ? (
        <div
          className="absolute end-0 z-50 mt-2 w-48 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/10"
          role="menu"
        >
          {profileHref ? (
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-[#F0F2F5]"
              role="menuitem"
            >
              {profileLabel}
            </Link>
          ) : null}
          <div className="px-0.5 pt-1">
            <LogoutButton className="w-full rounded-lg" onLogout={onLogout} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
