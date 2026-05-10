'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

function isIOS() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/i.test(ua);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true
  );
}

async function waitForServiceWorkerReady() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.ready;
  } catch {
    /* ignore */
  }
}

export default function InstallPwaButton({ className }) {
  /** @type {React.MutableRefObject<Event | null>} */
  const deferredPromptRef = useRef(null);
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState('');
  const [installing, setInstalling] = useState(false);

  const ios = useMemo(() => isIOS(), []);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setHasDeferredPrompt(true);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      deferredPromptRef.current = null;
      window.deferredPrompt = null;
      setHasDeferredPrompt(false);
    };

    // Check if it was already captured by layout script
    if (window.deferredPrompt) {
      deferredPromptRef.current = window.deferredPrompt;
      setHasDeferredPrompt(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (installed) return null;

  const showForIOS = ios && !isStandalone();

  const onClick = async () => {
    setHint('');

    let promptEvent = deferredPromptRef.current || window.deferredPrompt;

    if (!promptEvent) {
      await waitForServiceWorkerReady();
      await new Promise((r) => setTimeout(r, 400));
      promptEvent = deferredPromptRef.current || window.deferredPrompt;
    }

    if (!promptEvent && !showForIOS) {
      await waitForServiceWorkerReady();
      await new Promise((r) => setTimeout(r, 600));
      promptEvent = deferredPromptRef.current || window.deferredPrompt;
    }

    if (promptEvent) {
      setInstalling(true);
      try {
        await promptEvent.prompt();
        await promptEvent.userChoice.catch(() => null);
      } catch {
        setHint(
          'لم يكتمل التثبيت. تأكد من الاتصال بـ HTTPS (أو localhost) وجرب متصفح Chrome أو Edge، ثم أعد المحاولة.'
        );
      } finally {
        deferredPromptRef.current = null;
        window.deferredPrompt = null;
        setHasDeferredPrompt(false);
        setInstalling(false);
      }
      return;
    }

    if (showForIOS) {
      setHint(
        'لتثبيت الموقع على الآيفون: اضغط على أيقونة "المشاركة" (Share) في Safari، ثم اختر "Add to Home Screen".'
      );
      return;
    }

    // Smart Diagnostics
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const swActive = navigator.serviceWorker?.controller;

    if (!isSecure) {
      setHint(
        'تنبيه: المتصفح يمنع التثبيت لأن الاتصال غير آمن (HTTP). يرجى فتح الموقع عبر https أو localhost حصراً.'
      );
      return;
    }

    if (!swActive) {
      setHint(
        'المتصفح يظهر أن نظام التثبيت (Service Worker) لم يتفعل بعد. جرب تحديث الصفحة (Refresh) والانتظار لثانية.'
      );
      return;
    }

    setHint(
      'المتصفح لم يوفّر نافذة التثبيت التلقائية بعد. قد يكون التطبيق مثبتاً بالفعل، أو أن المتصفح لم يكمل فحص الموقع. جرّب التحديث أو استعمل خيار «تثبيت التطبيق» من قائمة المتصفح (⋮).'
    );
  };

  return (
    <>
      <button
        type="button"
        disabled={installing}
        onClick={onClick}
        className={cn(
          'rounded-full px-3 py-2 text-sm font-semibold transition-colors outline-none',
          'border border-white/25 bg-white/5 text-white/95 hover:bg-white/12 hover:ring-1 hover:ring-white/30',
          'disabled:pointer-events-none disabled:opacity-70',
          !hasDeferredPrompt && !showForIOS ? 'opacity-90' : null,
          className
        )}
        aria-label="تثبيت الموقع"
        title="تثبيت الموقع"
      >
        {installing ? 'جاري فتح التثبيت…' : 'تثبيت الموقع'}
      </button>
      {hint ? (
        <div className="fixed inset-x-4 bottom-4 z-60 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="min-w-0 flex-1">{hint}</p>
            <button
              type="button"
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setHint('')}
            >
              إغلاق
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
