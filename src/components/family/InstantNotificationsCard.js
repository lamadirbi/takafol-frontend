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
  const [channel, setChannel] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [browserStatus, setBrowserStatus] = useState('idle');
  const [browserBusy, setBrowserBusy] = useState(false);
  const [browserMsg, setBrowserMsg] = useState('');
  const store = useMemo(() => preferredStore(), []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pushSupported()) {
        if (!cancelled) setBrowserStatus('unsupported');
        return;
      }
      if (isIosDevice() && !isStandalonePwa()) {
        if (!cancelled) setBrowserStatus('ios');
        return;
      }
      const perm = notificationPermission();
      if (perm === 'denied') {
        if (!cancelled) setBrowserStatus('blocked');
        return;
      }
      if (perm === 'granted') {
        try {
          await ensurePush();
          if (!cancelled) setBrowserStatus('on');
        } catch {
          if (!cancelled) setBrowserStatus('off');
        }
        return;
      }
      if (!cancelled) setBrowserStatus('off');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendTest() {
    setTesting(true);
    setTestMsg('');
    try {
      const { data } = await api.post('/push/instant-channel/test');
      if (data?.topic) setChannel((c) => ({ ...(c || {}), ...data }));
      setTestMsg(
        data?.sent
          ? 'تم إرسال إشعار تجريبي. لازم يوصل على تطبيق ntfy حتى لو تَكافل مسكّر. إذا ما وصل، اضغطي «ربط الحساب» مرة ثانية.'
          : data?.message || 'تعذر إرسال الإشعار التجريبي.'
      );
    } catch (err) {
      setTestMsg(getApiErrorMessage(err, 'تعذر إرسال الإشعار التجريبي.'));
    } finally {
      setTesting(false);
    }
  }

  async function turnOnBrowser() {
    setBrowserBusy(true);
    setBrowserMsg('');
    try {
      await enablePush();
      setBrowserStatus('on');
      setBrowserMsg('تم تفعيل إشعار المتصفح على هذا الجهاز. الإشعار الموثوق يبقى عبر ntfy.');
    } catch (err) {
      if (String(err?.message) === 'DENIED') {
        setBrowserStatus('blocked');
        setBrowserMsg('المتصفح رفض الإذن. الإشعار الفوري يبقى عبر تطبيق ntfy.');
      } else {
        setBrowserMsg(err?.message || 'تعذر تفعيل إشعار المتصفح.');
      }
    } finally {
      setBrowserBusy(false);
    }
  }

  const playUrl = channel?.play_store_url || 'https://play.google.com/store/apps/details?id=io.heckel.ntfy';
  const appUrl = channel?.app_store_url || 'https://apps.apple.com/app/ntfy/id1625396347';
  const href = connectHref(channel);

  return (
    <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">إشعارات الطرود</h2>
      <p className="mt-1 text-sm text-foreground">
        الإشعار الفوري بيجي من تطبيق <strong>ntfy</strong> حتى لو تَكافل مسكّر أو المتصفح علّق. حمّليه ثم اربطي
        حسابك من الجوال.
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
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:brightness-95"
        >
          ربط الحساب
        </a>
      ) : (
        <p className="mt-3 text-sm text-[#65676B]">جاري تجهيز قناة الربط…</p>
      )}
      {channel?.topic ? (
        <button
          type="button"
          disabled={testing}
          onClick={sendTest}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
        >
          {testing ? 'جاري الإرسال…' : 'إرسال إشعار تجريبي'}
        </button>
      ) : null}
      {testMsg ? <p className="mt-2 text-sm text-muted-foreground">{testMsg}</p> : null}
      <p className="mt-2 text-xs leading-relaxed text-[#65676B]">
        على أندرويد: في إعدادات الهاتف خلّي البطارية لتطبيق ntfy بدون تقييد، وإلا الإشعارات بتوقف والهاتف مقفول.
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[#65676B]">
          إشعار المتصفح (قد يتأخر أو يتعلّق)
        </summary>
        <p className="mt-2 text-sm leading-relaxed text-[#65676B]">
          هذا اختياري. المتصفح أحياناً بحجب الإشعار أو بيعلّقه، لذلك الاعتماد الأساسي على ntfy.
        </p>
        {browserStatus === 'ios' ? (
          <p className="mt-2 text-sm text-[#65676B]">
            على الآيفون لازم تضيفي تَكافل للشاشة الرئيسية أولاً حتى يشتغل إشعار المتصفح.
          </p>
        ) : null}
        {browserStatus === 'blocked' ? (
          <p className="mt-2 text-sm text-[#65676B]">المتصفح حاجب الإشعارات لهذا الموقع.</p>
        ) : null}
        {browserStatus === 'on' ? (
          <p className="mt-2 text-sm font-medium text-primary">إشعار المتصفح مفعّل على هذا الجهاز.</p>
        ) : null}
        {browserStatus === 'off' || browserStatus === 'blocked' || browserStatus === 'ios' ? (
          <button
            type="button"
            disabled={browserBusy}
            onClick={turnOnBrowser}
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#E4E6EB] px-4 text-sm font-semibold text-foreground hover:bg-[#d8dadf] disabled:opacity-60"
          >
            {browserBusy ? 'جاري التفعيل…' : 'تفعيل إشعار المتصفح'}
          </button>
        ) : null}
        {browserMsg ? <p className="mt-2 text-sm text-muted-foreground">{browserMsg}</p> : null}
      </details>
    </section>
  );
}
