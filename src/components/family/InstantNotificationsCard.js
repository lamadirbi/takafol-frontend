'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';
import {
  enablePush,
  ensurePush,
  isIosDevice,
  isStandalonePwa,
  notificationPermission,
  pushSupported,
} from '@/lib/push';

function preferredStore() {
  if (typeof navigator === 'undefined') return 'both';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'both';
}

function connectHref(channel) {
  const topic = channel?.topic || '';
  const host = channel?.host || 'ntfy.sh';
  const httpsUrl = channel?.subscribe_url || (topic ? `https://${host}/${topic}` : '');
  const deep = channel?.deep_link || (topic ? `ntfy://${host}/${topic}` : httpsUrl);
  if (!topic) return '';

  if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '')) {
    return `intent://${host}/${topic}#Intent;scheme=https;package=io.heckel.ntfy;S.browser_fallback_url=${encodeURIComponent(httpsUrl)};end`;
  }
  return deep;
}

export default function InstantNotificationsCard() {
  const [status, setStatus] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [iosNeedsInstall, setIosNeedsInstall] = useState(false);
  const [channel, setChannel] = useState(null);
  const [ntfyOpen, setNtfyOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const store = useMemo(() => preferredStore(), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!pushSupported()) {
        if (!cancelled) setStatus('unsupported');
        return;
      }
      if (isIosDevice() && !isStandalonePwa()) {
        if (!cancelled) {
          setIosNeedsInstall(true);
          setStatus('off');
        }
        return;
      }

      const perm = notificationPermission();
      if (perm === 'denied') {
        if (!cancelled) setStatus('blocked');
        return;
      }
      if (perm === 'granted') {
        try {
          await ensurePush();
          if (!cancelled) {
            setStatus('on');
            setMsg('الإشعارات شغّالة على هذا الجهاز.');
          }
        } catch {
          if (!cancelled) setStatus('off');
        }
        return;
      }
      if (!cancelled) setStatus('off');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ntfyOpen || channel) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/push/instant-channel');
        if (!cancelled) setChannel(data);
      } catch {
        try {
          const { data } = await api.get('/push/instant-app');
          if (!cancelled) setChannel(data);
        } catch {
          if (!cancelled) setChannel(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ntfyOpen, channel]);

  async function turnOn() {
    setBusy(true);
    setMsg('');
    try {
      await enablePush();
      setStatus('on');
      setMsg('تم تفعيل الإشعارات. بنبعتلك تنبيه تجريبي الآن.');
      await sendTest(true);
    } catch (err) {
      if (String(err?.message) === 'DENIED') {
        setStatus('blocked');
        setMsg('المتصفح رفض الإشعارات. من إعدادات الموقع (القفل بجانب الرابط) اسمحي بالإشعارات ثم اضغطي تشغيل مرة ثانية.');
      } else {
        setMsg(err?.message || 'تعذر تفعيل الإشعارات.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendTest(fromEnable = false) {
    if (!fromEnable) {
      setTesting(true);
      setMsg('');
    }
    try {
      const { data } = await api.post('/push/instant-channel/test');
      if (data?.topic) setChannel((c) => ({ ...(c || {}), ...data }));
      setMsg(
        data?.sent
          ? 'وصل الإشعار التجريبي؟ إذا ما طلع، تأكدي إن الإشعارات مسموحة لهذا الموقع.'
          : data?.message || 'تعذر إرسال الإشعار التجريبي.'
      );
    } catch (err) {
      setMsg(getApiErrorMessage(err, 'تعذر إرسال الإشعار التجريبي.'));
    } finally {
      if (!fromEnable) setTesting(false);
    }
  }

  const playUrl = channel?.play_store_url || 'https://play.google.com/store/apps/details?id=io.heckel.ntfy';
  const appUrl = channel?.app_store_url || 'https://apps.apple.com/app/ntfy/id1625396347';
  const href = connectHref(channel);

  return (
    <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">إشعارات الطرود</h2>
      <p className="mt-1 text-sm text-[#65676B]">
        ضغطة واحدة تكفي. الإشعار يجي على هذا الجهاز حتى لو التطبيق مش مفتوح قدامك.
      </p>

      {iosNeedsInstall ? (
        <p className="mt-3 rounded-lg bg-[#F0F2F5] p-3 text-sm leading-relaxed text-foreground">
          على الآيفون: من Safari اضغطي مشاركة ثم «إضافة إلى الشاشة الرئيسية»، وبعدين افتحي تَكافل من الأيقونة
          وشغّلي الإشعارات.
        </p>
      ) : null}

      {status === 'unsupported' ? (
        <p className="mt-3 text-sm text-[#65676B]">
          هذا المتصفح لا يدعم إشعارات الموقع. استعملي Chrome أو ثبّتي التطبيق من القائمة.
        </p>
      ) : null}

      {status === 'blocked' ? (
        <p className="mt-3 rounded-lg bg-[#F0F2F5] p-3 text-sm leading-relaxed text-foreground">
          المتصفح حاجب الإشعارات لهذا الموقع. اضغطي على القفل بجانب الرابط ← الإشعارات ← السماح، بعدين ارجعي
          لهون واضغطي تشغيل.
        </p>
      ) : null}

      {status === 'on' ? (
        <p className="mt-3 text-sm font-medium text-primary">الإشعارات مفعّلة على هذا الجهاز.</p>
      ) : null}

      {status === 'off' || status === 'blocked' ? (
        <button
          type="button"
          disabled={busy}
          onClick={turnOn}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {busy ? 'جاري التفعيل…' : 'تشغيل الإشعارات'}
        </button>
      ) : null}

      {status === 'on' ? (
        <button
          type="button"
          disabled={testing}
          onClick={() => sendTest(false)}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
        >
          {testing ? 'جاري الإرسال…' : 'إرسال إشعار تجريبي'}
        </button>
      ) : null}

      {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}

      <details
        className="mt-3"
        onToggle={(e) => setNtfyOpen(e.currentTarget.open)}
      >
        <summary className="cursor-pointer text-sm font-medium text-[#65676B]">
          خيار إضافي: تطبيق ntfy للجوال
        </summary>
        <p className="mt-2 text-sm leading-relaxed text-[#65676B]">
          مش لازم. استعمليه فقط إذا بدك إشعار والجوال مقفول بدون فتح تَكافل أبداً.
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
        {href ? (
          <a
            href={href}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf]"
          >
            ربط حساب ntfy
          </a>
        ) : ntfyOpen ? (
          <p className="mt-2 text-xs text-[#65676B]">جاري تجهيز قناة الربط…</p>
        ) : null}
      </details>
    </section>
  );
}
