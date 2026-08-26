'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function LogoutButton({
  onLogout,
  label = 'تسجيل الخروج',
  variant = 'outline',
  size = 'sm',
  className,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      await onLogout?.();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        onConfirm={confirm}
        title="تأكيد تسجيل الخروج"
        message="هل تريد تسجيل الخروج؟ يمكنك الدخول مرة أخرى بنفس بياناتك في أي وقت."
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        danger
        loading={loading}
      />
    </>
  );
}
