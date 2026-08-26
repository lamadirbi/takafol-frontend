/* global self */

self.addEventListener('install', (event) => {
  // Activate this version immediately.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Take control of all existing clients so installability checks pass.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // لا نعترض طلبات الـ API حتى لا يُحذف توكن الدخول ويظهر وكأن المستخدم سجّل خروجاً.
  if (url.pathname.includes('/api') || url.origin !== self.location.origin) {
    return;
  }
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'إشعار جديد', body: event.data?.text?.() };
  }

  const title = payload.title || 'إشعار جديد';
  const body = payload.body || '';
  const url = payload.url || '/';
  const data = { ...(payload.data || {}), url };

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data,
      dir: 'rtl',
      lang: 'ar',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const had = clientsArr.find((c) => c.url.includes(url));
      if (had) return had.focus();
      return self.clients.openWindow(url);
    })
  );
});

