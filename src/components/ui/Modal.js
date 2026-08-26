'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import Button from './Button';
import { IconClose } from './Icons';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  title,
  children,
  onClose,
  className,
  wrapperClassName,
  centered = false,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return undefined;

    previousFocus.current = document.activeElement;
    const panel = panelRef.current;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    const first = panel?.querySelector(FOCUSABLE);
    first?.focus();

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        previousFocus.current.focus();
      }
    };
  }, [open, onClose, mounted]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[200] flex justify-center p-4',
        centered ? 'items-center' : 'items-end sm:items-center',
        wrapperClassName
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(28,25,21,0.38)]"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 flex min-h-0 w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-black/8 bg-white shadow-lg',
          className
        )}
      >
        <div className="mb-0 flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4">
          {title ? (
            <h3 id={titleId} className="text-[length:var(--text-h3)] font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-11 w-11 shrink-0 p-0"
            aria-label="إغلاق النافذة"
          >
            <IconClose className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
