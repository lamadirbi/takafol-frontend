'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * نافذة تأكيد مخصّصة — بديل عن alert/confirm
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'تأكيد',
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = false,
  loading = false,
  /** فوق نوافذ أخرى (مثل Modal متداخل) */
  nested = false,
}) {
  const handleClose = loading ? undefined : onClose;

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
      <div className="flex flex-wrap justify-end gap-2" dir="rtl">
        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={danger ? 'danger' : 'primary'}
          disabled={loading}
          loading={loading}
          className={cn(danger && 'focus-visible:outline-destructive')}
          onClick={() => onConfirm?.()}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
