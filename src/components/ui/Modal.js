'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

export default function Modal({ open, title, children, onClose, className, wrapperClassName }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4',
        wrapperClassName
      )}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : <span />}
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
