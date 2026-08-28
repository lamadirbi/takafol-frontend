'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function initials(name) {
  const s = String(name || '').trim();
  return s ? s.slice(0, 1) : 'أ';
}

export default function AccountMenu({
  name,
  onLogout,
  profileHref,
  profileLabel = 'حسابي',
  extraLinks = [],
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current?.contains(e.target)) return;
      if (e.target?.closest?.('[role="dialog"]')) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && !confirmOpen) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, confirmOpen]);

  async function confirmLogout() {
    setLeaving(true);
    try {
      await onLogout?.();
    } finally {
      setLeaving(false);
      setConfirmOpen(false);
      setOpen(false);
    }
  }

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
          {extraLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-[#F0F2F5]"
              role="menuitem"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setConfirmOpen(true);
            }}
            className="mt-1 flex min-h-10 w-full items-center rounded-lg px-3 text-sm font-semibold text-[#E41E3F] hover:bg-[#F0F2F5]"
          >
            تسجيل الخروج
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !leaving && setConfirmOpen(false)}
        onConfirm={confirmLogout}
        title="تأكيد تسجيل الخروج"
        message="هل تريد تسجيل الخروج؟ يمكنك الدخول مرة أخرى بنفس بياناتك في أي وقت."
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        danger
        loading={leaving}
      />
    </div>
  );
}
