'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { NoticeProvider } from '@/context/NoticeContext';

export default function Providers({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const host = window.location.hostname;
    const isLocalDev =
      process.env.NODE_ENV !== 'production' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) ||
      host.endsWith('.loca.lt') ||
      host.endsWith('.trycloudflare.com') ||
      host.endsWith('.ngrok-free.app') ||
      host.endsWith('.ngrok.io') ||
      host.endsWith('.pinggy.io') ||
      host.endsWith('.localhost.run');

    // التطوير / الشبكة المحلية / الأنفاق: لا تسجّل SW حتى لا يعلّق تحميل الجوال.
    if (isLocalDev) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      return;
    }
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        // Avoid noisy logs in production; still helpful during local dev.
        if (isLocalhost) console.warn('Service worker registration failed', err);
      }
    };

    register();
  }, []);

  return (
    <AuthProvider>
      <NoticeProvider>{children}</NoticeProvider>
    </AuthProvider>
  );
}
