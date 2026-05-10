'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export default function Providers({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1';

    // Register SW for PWA installability + push notifications.
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

  return <AuthProvider>{children}</AuthProvider>;
}
