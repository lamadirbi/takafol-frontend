'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  clearNtfyAppOpened,
  clearNtfyLinkConfirmed,
  markNtfyAppOpened,
  markNtfyAskedOpen,
  markNtfyLinkConfirmed,
  markNtfyStoreOpened,
  ntfyAppOpened,
  ntfyAskedOpen,
  ntfyDeviceKey,
  ntfyLinkConfirmed,
  ntfyStoreOpened,
} from '@/lib/ntfyDevice';
import { getApiErrorMessage } from '@/lib/utils';

function preferredStore() {
  if (typeof navigator === 'undefined') return 'both';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'both';
}

function installHref(channel, store) {
  if (store === 'ios') {
    return channel?.app_store_url || 'https://apps.apple.com/app/ntfy/id1625396347';
  }
  if (store === 'android') {
    return (
      channel?.android_install_intent ||
      channel?.play_store_url ||
      'https://play.google.com/store/apps/details?id=io.heckel.ntfy'
    );
  }
  return channel?.play_store_url || 'https://play.google.com/store/apps/details?id=io.heckel.ntfy';
}

function nativeAppHref(channel) {
  const topic = channel?.topic || '';
  const host = channel?.host || 'ntfy.sh';
  if (!topic) return '';
  if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '')) {
    return channel?.android_intent || `intent://${host}/${topic}#Intent;scheme=ntfy;package=io.heckel.ntfy;end`;
  }
  return channel?.deep_link || `ntfy://${host}/${topic}`;
}

const NOTIFICATION_HINT = 'تأكد إن إشعارات التطبيق مفعّلة حتى يوصلك الإشعارات.';

export default function InstantNotificationsCard({
  title = 'إشعارات الطرود',
  description = 'ثبّت تطبيق ntfy، افتحه، بعدين اربط الجهاز. كل جهاز يُربَط لوحده.',
}) {
  const deviceKey = useMemo(() => ntfyDeviceKey(), []);
  const [channel, setChannel] = useState(null);
  const [storeOpened, setStoreOpened] = useState(false);
  const [askedOpen, setAskedOpen] = useState(false);
  const [appOpened, setAppOpened] = useState(false);
  const [linkConfirmed, setLinkConfirmed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const store = useMemo(() => preferredStore(), []);

  useEffect(() => {
    setStoreOpened(ntfyStoreOpened());
    setAskedOpen(ntfyAskedOpen());
    setAppOpened(ntfyAppOpened());
    setLinkConfirmed(ntfyLinkConfirmed());
  }, []);

  useEffect(() => {
    if (!deviceKey) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/push/instant-channel', { params: { device_key: deviceKey } });
        if (!cancelled) setChannel(data);
      } catch {
        if (!cancelled) setChannel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deviceKey]);

  async function installApp() {
    const href = installHref(channel, store);
    setBusy(true);
    setMsg('');
    clearNtfyAppOpened();
    setAskedOpen(false);
    setAppOpened(false);
    try {
      await api.post('/push/instant-channel/installed', { device_key: deviceKey });
      markNtfyStoreOpened();
      setStoreOpened(true);
      setChannel((c) => (c ? { ...c, installed: true } : c));
      if (href) {
        window.location.href = href;
      }
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'تعذر فتح متجر التطبيق.'));
    } finally {
      setBusy(false);
    }
  }

  function openNtfyApp() {
    setMsg('');
    markNtfyAskedOpen();
    setAskedOpen(true);
    setAppOpened(false);
    const href = nativeAppHref(channel);
    if (href) {
      window.location.href = href;
    }
  }

  function chooseAppOpened() {
    markNtfyAppOpened();
    setAskedOpen(false);
    setAppOpened(true);
    setMsg('');
  }

  function chooseStillDownloading() {
    clearNtfyAppOpened();
    setAskedOpen(false);
    setAppOpened(false);
    setMsg('بعد ما يخلص التثبيت، ارجع اضغط على فتح تطبيق ntfy مجدداً.');
  }

  async function confirmLink() {
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/link', { device_key: deviceKey });
      markNtfyLinkConfirmed();
      setLinkConfirmed(true);
      setChannel(data);
      setMsg(NOTIFICATION_HINT);
      const href = nativeAppHref(data);
      if (href) {
        window.location.href = href;
      }
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'ما قدرنا نربط هذا الجهاز.'));
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/unlink', { device_key: deviceKey });
      clearNtfyLinkConfirmed();
      setLinkConfirmed(false);
      setAskedOpen(false);
      setAppOpened(false);
      setChannel(data);
      setMsg('تم فك ربط هذا الجهاز.');
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'تعذر فك الربط.'));
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/test', { device_key: deviceKey });
      if (data?.topic) setChannel((c) => ({ ...(c || {}), ...data }));
      setMsg(
        data?.sent
          ? 'تم إرسال إشعار تجريبي لهذا الجهاز.'
          : data?.message || 'تعذر إرسال الإشعار التجريبي.'
      );
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'تعذر إرسال الإشعار التجريبي.'));
    } finally {
      setTesting(false);
    }
  }

  const linked = Boolean(channel?.linked) && linkConfirmed;

  if (linked) {
    return (
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-primary">هذا الجهاز مربوط مع ntfy</p>
        <p className="mt-1 text-sm text-[#65676B]">{NOTIFICATION_HINT}</p>
        <button
          type="button"
          disabled={testing}
          onClick={sendTest}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
        >
          {testing ? 'جاري الإرسال…' : 'إرسال إشعار تجريبي'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={unlink}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-[#E41E3F] hover:bg-[#F0F2F5] disabled:opacity-60"
        >
          {busy ? 'جاري فك الربط…' : 'فك ربط هذا الجهاز'}
        </button>
        {msg && msg !== NOTIFICATION_HINT ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-foreground">{description}</p>
      <button
        type="button"
        disabled={busy || !deviceKey}
        onClick={installApp}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
      >
        {busy ? 'جاري فتح المتجر…' : 'تثبيت التطبيق'}
      </button>
      {storeOpened ? (
        <button
          type="button"
          disabled={busy || !channel?.topic}
          onClick={openNtfyApp}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
        >
          فتح تطبيق ntfy
        </button>
      ) : null}
      {askedOpen ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold text-foreground">شو صار مع التطبيق؟</p>
          <button
            type="button"
            disabled={busy}
            onClick={chooseAppOpened}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            التطبيق فتح وتم تثبيته
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={chooseStillDownloading}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
          >
            التطبيق لسا ما فتح وقيد التحميل
          </button>
        </div>
      ) : null}
      {appOpened ? (
        <button
          type="button"
          disabled={busy || !channel?.topic}
          onClick={confirmLink}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          ربط هذا الجهاز
        </button>
      ) : null}
      {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
    </section>
  );
}
