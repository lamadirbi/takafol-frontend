import { api } from '@/lib/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function notificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function isIosDevice() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/i.test(window.navigator.userAgent || '');
}

export function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
    window.navigator.standalone === true
  );
}

export async function getCurrentSubscription() {
  if (!pushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function fetchPublicKey() {
  const { data } = await api.get('/push/public-key');
  const publicKey = String(data?.public_key || '').trim();
  if (!publicKey) {
    throw new Error('الإشعارات غير مفعّلة على السيرفر بعد.');
  }
  return publicKey;
}

async function registerWorker() {
  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (window.location.protocol !== 'https:' && !isLocalhost) {
    throw new Error('افتح الموقع على HTTPS حتى تشتغل الإشعارات.');
  }

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    throw new Error('تعذر تجهيز الإشعارات. حدّث الصفحة ثم أعد المحاولة.');
  }

  return navigator.serviceWorker.ready;
}

async function saveSubscription(sub) {
  try {
    await api.post('/push/subscribe', sub.toJSON());
  } catch (e) {
    const status = e?.response?.status;
    const msg =
      e?.response?.data?.message ||
      (typeof e?.response?.data === 'string' ? e.response.data : '') ||
      '';
    if (status === 401) throw new Error('سجّل دخولك قبل تفعيل الإشعارات.');
    if (msg) throw new Error(`تعذر حفظ الاشتراك: ${msg}`);
    throw new Error('تعذر حفظ الاشتراك على السيرفر.');
  }
}

async function createSubscription(reg, publicKey) {
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    await saveSubscription(existing);
    return existing;
  }

  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await saveSubscription(sub);
    return sub;
  } catch (e) {
    const name = e?.name ? String(e.name) : '';
    if (name === 'NotAllowedError') {
      throw new Error('المتصفح منع الإشعارات. من إعدادات الموقع اسمح بالإشعارات ثم أعد المحاولة.');
    }
    if (name === 'SecurityError') {
      throw new Error('افتح الموقع على HTTPS حتى تشتغل الإشعارات.');
    }
    throw new Error(e?.message || 'تعذر تفعيل إشعارات هذا الجهاز.');
  }
}

/** يعيد الاشتراك إذا الإذن موجود مسبقاً، بدون طلب إذن جديد. */
export async function ensurePush() {
  if (!pushSupported()) {
    throw new Error('هذا المتصفح لا يدعم إشعارات الموقع.');
  }
  if (notificationPermission() !== 'granted') {
    return null;
  }
  const publicKey = await fetchPublicKey();
  const reg = await registerWorker();
  return createSubscription(reg, publicKey);
}

export async function enablePush() {
  if (!pushSupported()) {
    throw new Error('هذا المتصفح لا يدعم إشعارات الموقع.');
  }

  let perm = notificationPermission();
  if (perm !== 'granted') {
    try {
      perm = await Notification.requestPermission();
    } catch {
      throw new Error('تعذر طلب إذن الإشعارات من المتصفح.');
    }
  }
  if (perm !== 'granted') {
    throw new Error('DENIED');
  }

  const publicKey = await fetchPublicKey();
  const reg = await registerWorker();
  return createSubscription(reg, publicKey);
}

export async function disablePush() {
  if (!pushSupported()) return;

  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    try {
      await api.post('/push/unsubscribe', { endpoint: sub.endpoint });
    } catch {
      // تجاهل
    }
    try {
      await sub.unsubscribe();
    } catch {
      // تجاهل
    }
  }
}
