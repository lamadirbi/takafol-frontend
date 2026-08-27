'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { ntfyDeviceKey } from '@/lib/ntfyDevice';
import { getApiErrorMessage } from '@/lib/utils';

function preferredStore() {
  if (typeof navigator === 'undefined') return 'both';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'both';
}

function nativeAppHref(channel) {
  const topic = channel?.topic || '';
  const host = channel?.host || 'ntfy.sh';
  if (!topic) return '';
  if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '')) {
    return (
      channel?.android_intent ||
      `intent://${host}/${topic}#Intent;scheme=ntfy;package=io.heckel.ntfy;S.browser_fallback_url=${encodeURIComponent(
        channel?.play_store_url || 'https://play.google.com/store/apps/details?id=io.heckel.ntfy'
      )};end`
    );
  }
  return channel?.deep_link || `ntfy://${host}/${topic}`;
}

export default function InstantNotificationsCard({
  title = 'إشعارات الطرود',
  description = 'ثبّت تطبيق ntfy على هذا الجهاز، أكّد التثبيت، ثم اربط الجهاز. كل جهاز يُربَط لوحده حتى لو نفس الحساب.',
}) {
  const deviceKey = useMemo(() => ntfyDeviceKey(), []);
  const [channel, setChannel] = useState(null);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const store = useMemo(() => preferredStore(), []);

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

  async function confirmInstalled() {
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/installed', { device_key: deviceKey });
      setChannel(data);
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'تعذر تأكيد التثبيت. ثبّت التطبيق من المتجر ثم أعد المحاولة.'));
    } finally {
      setBusy(false);
    }
  }

  async function connectApp() {
    const href = nativeAppHref(channel);
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/link', { device_key: deviceKey });
      setChannel(data);
      if (href) {
        window.location.href = href;
      }
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'أكّد تثبيت التطبيق أولاً ثم اربط هذا الجهاز.'));
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/unlink', { device_key: deviceKey });
      setChannel(data);
      setMsg('تم فك ربط هذا الجهاز. الأجهزة الأخرى تبقى مربوطة.');
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

  const playUrl = channel?.play_store_url || 'https://play.google.com/store/apps/details?id=io.heckel.ntfy';
  const appUrl = channel?.app_store_url || 'https://apps.apple.com/app/ntfy/id1625396347';
  const installed = Boolean(channel?.installed);
  const linked = Boolean(channel?.linked);

  if (linked) {
    return (
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-primary">هذا الجهاز مربوط مع ntfy</p>
        <p className="mt-1 text-sm text-[#65676B]">الإشعار بيوصل على هذا الجهاز فقط بعد ربطه. أي جهاز ثاني يحتاج ربط منفصل.</p>
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
      <div className="mt-3 flex flex-wrap gap-2">
        {store !== 'ios' ? (
          <a
            href={playUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1877F2] px-4 text-sm font-semibold text-white hover:brightness-95"
          >
            Google Play
          </a>
        ) : null}
        {store !== 'android' ? (
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf]"
          >
            App Store
          </a>
        ) : null}
      </div>
      {!installed ? (
        <button
          type="button"
          disabled={busy || !deviceKey}
          onClick={confirmInstalled}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {busy ? 'جاري التأكيد…' : 'ثبّتت التطبيق'}
        </button>
      ) : (
        <button
          type="button"
          disabled={busy || !channel?.topic}
          onClick={connectApp}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {busy ? 'جاري فتح التطبيق…' : 'ربط هذا الجهاز'}
        </button>
      )}
      {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
      <p className="mt-2 text-xs leading-relaxed text-[#65676B]">
        على أندرويد: خلّي بطارية تطبيق ntfy بدون تقييد حتى يوصل الإشعار والهاتف مقفول.
      </p>
    </section>
  );
}
