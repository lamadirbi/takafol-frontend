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
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getPushPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function getCurrentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return await reg.pushManager.getSubscription();
}

export async function enablePush() {
  if (!pushSupported()) {
    throw new Error('Push not supported');
  }

  // Web Push requires a secure context (HTTPS) except for localhost.
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && !isLocalhost) {
    throw new Error('لازم تفتحي الموقع على HTTPS لتفعيل إشعارات الهاتف (أو استخدمي localhost).');
  }

  let perm = 'default';
  try {
    perm = await Notification.requestPermission();
  } catch (e) {
    throw new Error('تعذر طلب إذن الإشعارات من المتصفح.');
  }
  if (perm !== 'granted') {
    throw new Error('تم رفض إذن الإشعارات من المتصفح.');
  }

  let publicKey = '';
  try {
    const { data } = await api.get('/push/public-key');
    publicKey = String(data?.public_key || '').trim();
  } catch (e) {
    throw new Error('تعذر جلب مفتاح الإشعارات من السيرفر.');
  }
  if (!publicKey) {
    throw new Error('Missing VAPID public key');
  }

  let reg;
  try {
    reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (e) {
    throw new Error('تعذر تسجيل Service Worker. تأكد أنك تفتح الموقع على HTTPS أو localhost.');
  }

  let sub;
  try {
    const existing = await reg.pushManager.getSubscription();
    sub =
      existing ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));
  } catch (e) {
    const name = e?.name ? String(e.name) : '';
    if (name === 'NotAllowedError') {
      throw new Error('المتصفح منع إنشاء اشتراك Push. تأكد أن الإشعارات مسموحة للموقع وأن وضع توفير البطارية ليس مانعاً.');
    }
    if (name === 'SecurityError') {
      throw new Error('لا يمكن إنشاء اشتراك Push لأن الصفحة ليست ضمن Secure Context (HTTPS/localhost).');
    }
    throw new Error('تعذر إنشاء اشتراك Push من المتصفح.');
  }

  try {
    await api.post('/push/subscribe', sub.toJSON());
  } catch (e) {
    const status = e?.response?.status;
    const msg =
      e?.response?.data?.message ||
      (typeof e?.response?.data === 'string' ? e.response.data : '') ||
      '';
    if (status === 401) throw new Error('لازم تسجّل دخولك قبل تفعيل الإشعارات.');
    if (msg) throw new Error(`تعذر حفظ الاشتراك على السيرفر: ${msg}`);
    throw new Error('تعذر حفظ الاشتراك على السيرفر.');
  }
  return sub;
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

