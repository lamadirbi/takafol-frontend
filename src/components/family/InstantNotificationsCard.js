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

  const playUrl = channel?.play_store_url || 'https://play.google.com/store/apps/details?id=io.heckel.ntfy';
  const appUrl = channel?.app_store_url || 'https://apps.apple.com/app/ntfy/id1625396347';
  const href = connectHref(channel);

  return (
    <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-foreground">
        للحصول على إشعارات فورية للطرود حمّل تطبيق <strong>ntfy</strong> ثم اربطي حسابك من الجوال. الإشعار يجي على
        ntfy حتى لو تطبيق تَكافل مش مفتوح.
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
      ) : null}
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
    </section>
  );
}
