'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * نافذة رسالة منبثقة — بديل عن window.alert
 */
export default function MessageDialog({
  open,
  onClose,
  title = 'تنبيه',
  message,
  confirmLabel = 'حسناً',
  nested = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-md"
      centered
      wrapperClassName={nested ? 'z-[100]' : undefined}
    >
      {message != null && message !== '' ? (
        typeof message === 'string' ? (
          <p className="mb-6 text-right text-sm leading-relaxed text-muted-foreground">{message}</p>
        ) : (
          <div className="mb-6 text-right text-sm leading-relaxed text-muted-foreground">{message}</div>
        )
      ) : null}
      <div className="flex justify-end" dir="rtl">
        <Button type="button" variant="primary" onClick={onClose}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
