'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  clearNtfyAppOpened,
  clearNtfyLinkConfirmed,
  markNtfyAppOpened,
  markNtfyLinkConfirmed,
  markNtfyStoreOpened,
  ntfyAppOpened,
  ntfyDeviceKey,
  ntfyLinkConfirmed,
  ntfyPendingOpenKey,
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

export default function InstantNotificationsCard({
  title = 'إشعارات الطرود',
  description = 'ثبّت تطبيق ntfy، وانتظر يخلص التثبيت ويفتح على الجهاز، بعدين أكّد الربط. كل جهاز يُربَط لوحده.',
}) {
  const deviceKey = useMemo(() => ntfyDeviceKey(), []);
  const [channel, setChannel] = useState(null);
  const [storeOpened, setStoreOpened] = useState(false);
  const [appOpened, setAppOpened] = useState(false);
  const [linkConfirmed, setLinkConfirmed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const store = useMemo(() => preferredStore(), []);

  useEffect(() => {
    setStoreOpened(ntfyStoreOpened());
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

  useEffect(() => {
    if (!deviceKey) return undefined;

    function noteAppOpened(event) {
      if (typeof window === 'undefined') return;
      const pending = window.sessionStorage.getItem(ntfyPendingOpenKey());
      if (pending !== deviceKey) return;
      const left =
        event?.type === 'pagehide' || document.hidden || document.visibilityState === 'hidden';
      if (!left) return;
      markNtfyAppOpened();
      setAppOpened(true);
    }

    document.addEventListener('visibilitychange', noteAppOpened);
    window.addEventListener('pagehide', noteAppOpened);
    return () => {
      document.removeEventListener('visibilitychange', noteAppOpened);
      window.removeEventListener('pagehide', noteAppOpened);
    };
  }, [deviceKey]);

  async function installApp() {
    const href = installHref(channel, store);
    setBusy(true);
    setMsg('');
    clearNtfyAppOpened();
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
    const href = nativeAppHref(channel);
    if (!href) {
      setMsg('ثبّت تطبيق ntfy أولاً وانتظر حتى يخلص التثبيت.');
      return;
    }
    setBusy(true);
    setMsg('');
    let leftPage = false;
    const onHide = () => {
      if (document.hidden) leftPage = true;
    };
    document.addEventListener('visibilitychange', onHide);
    try {
      window.sessionStorage.setItem(ntfyPendingOpenKey(), deviceKey);
    } catch {
      /* ignore */
    }
    window.location.href = href;
    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide);
      if (document.visibilityState === 'visible' && !leftPage && !ntfyAppOpened()) {
        clearNtfyAppOpened();
        setAppOpened(false);
        setMsg('تطبيق ntfy لسا ما فتح. انتظر يخلص التثبيت، افتحه من قائمة التطبيقات، بعدين ارجع واضغط فتح تطبيق ntfy.');
        setBusy(false);
        return;
      }
      setBusy(false);
    }, 1800);
  }

  function dismissAppOpened() {
    clearNtfyAppOpened();
    setAppOpened(false);
    setMsg('تمام. بعد ما يخلص التثبيت ويفتح تطبيق ntfy على الجهاز، اضغط فتح تطبيق ntfy.');
  }

  async function confirmLink() {
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/link', { device_key: deviceKey });
      markNtfyLinkConfirmed();
      setLinkConfirmed(true);
      setChannel(data);
      setMsg('تم ربط هذا الجهاز. أرسل إشعار تجريبي للتأكد.');
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'ما قدرنا نربط. تأكد إن تطبيق ntfy فتح على الجهاز.'));
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
        <p className="mt-1 text-sm text-[#65676B]">الإشعار بيوصل على هذا الجهاز بعد ربط تطبيق ntfy المثبّت.</p>
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
        {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
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
        {busy && !storeOpened ? 'جاري فتح المتجر…' : 'تثبيت التطبيق'}
      </button>
      {storeOpened ? (
        <button
          type="button"
          disabled={busy || !channel?.topic}
          onClick={openNtfyApp}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
        >
          {busy ? 'جاري فتح التطبيق…' : 'فتح تطبيق ntfy'}
        </button>
      ) : null}
      {appOpened ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={confirmLink}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            تأكيد الربط
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={dismissAppOpened}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-[#65676B] hover:bg-[#F0F2F5] disabled:opacity-60"
          >
            التطبيق لسا ما فتح
          </button>
        </>
      ) : null}
      {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
      <p className="mt-2 text-xs leading-relaxed text-[#65676B]">
        زر الربط ما بيظهر إلا بعد ما تطبيق ntfy يفتح على الجهاز. إذا فتح المتجر وما خلص التثبيت، لا تضغط تأكيد الربط.
      </p>
    </section>
  );
}
