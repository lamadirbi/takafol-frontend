'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
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

export default function InstantNotificationsCard() {
  const [channel, setChannel] = useState(null);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const store = useMemo(() => preferredStore(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/push/instant-channel');
        if (!cancelled) setChannel(data);
      } catch {
        if (!cancelled) setChannel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function connectApp() {
    const href = nativeAppHref(channel);
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/link');
      setChannel(data);
      if (href) {
        window.location.href = href;
      }
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'تعذر فتح تطبيق ntfy. ثبّتيه من المتجر ثم أعيدي الربط.'));
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    setMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/unlink');
      setChannel(data);
      setMsg('تم فك الربط. الإشعارات توقفت إلى أن تربطي التطبيق مرة ثانية.');
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
      const { data } = await api.post('/push/instant-channel/test');
      if (data?.topic) setChannel((c) => ({ ...(c || {}), ...data }));
      setMsg(
        data?.sent
          ? 'تم إرسال إشعار تجريبي لتطبيق ntfy المثبّت.'
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
  const linked = Boolean(channel?.linked);

  if (linked) {
    return (
      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-primary">تم الربط مع تطبيق ntfy</p>
        <p className="mt-1 text-sm text-[#65676B]">الإشعار بيوصل حصراً على التطبيق المثبّت، مش من نسخة الويب.</p>
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
          {busy ? 'جاري فك الربط…' : 'فك الربط'}
        </button>
        {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">إشعارات الطرود</h2>
      <p className="mt-1 text-sm text-foreground">
        الإشعار بيوصل حصراً من تطبيق <strong>ntfy</strong> المثبّت على الجوال، مش من المتصفح ولا من موقع ntfy.
        ثبّتي التطبيق ثم اضغطي ربط الحساب حتى ينفتح التطبيق مباشرة.
      </p>
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
      <button
        type="button"
        disabled={busy || !channel?.topic}
        onClick={connectApp}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
      >
        {busy ? 'جاري فتح التطبيق…' : 'ربط الحساب'}
      </button>
      {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
      <p className="mt-2 text-xs leading-relaxed text-[#65676B]">
        على أندرويد: خلّي بطارية تطبيق ntfy بدون تقييد حتى يوصل الإشعار والهاتف مقفول.
      </p>
    </section>
  );
}
