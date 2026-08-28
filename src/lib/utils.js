export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** مصفوفة من Laravel JsonResource قد تُرسل كـ { data: [...] } */
export function unwrapResourceArray(value) {
  if (value == null) return [];
  const list = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
  return list.map((item) => item?.data ?? item);
}

/**
 * عنصر واحد من Resource (مثل family داخل JSON).
 */
export function unwrapResource(value) {
  if (value == null) return null;
  return value?.data ?? value;
}

/**
 * قائمة من استجابة Axios لـ index (مصفوفة أو { data: [] } أو ترقيم Laravel).
 */
export function unwrapApiList(response) {
  const body = response?.data;
  if (body == null) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data.map((item) => item?.data ?? item);
  return [];
}

/** ترقيم Laravel: العناصر + إجمالي السجلات في meta.total */
export function unwrapPaginated(response) {
  const body = response?.data;
  if (!body) return { items: [], total: 0, meta: null };
  const items = Array.isArray(body.data)
    ? body.data.map((item) => item?.data ?? item)
    : Array.isArray(body)
      ? body
      : [];
  const total = body.meta?.total ?? body.total ?? items.length;
  return { items, total, meta: body.meta ?? null };
}

export function formatDate(value) {
  if (!value) return '';
  try {
    // Force Gregorian calendar (avoid Hijri default in some ar locales).
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

/** وقت نسبي مألوف (مثل المنشورات) */
export function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const sec = Math.round((Date.now() - date.getTime()) / 1000);
  if (sec < 45) return 'الآن';
  if (sec < 3600) return `منذ ${Math.max(1, Math.floor(sec / 60))} د`;
  if (sec < 86400) return `منذ ${Math.floor(sec / 3600)} س`;
  const days = Math.floor(sec / 86400);
  if (days === 1) return 'أمس';
  if (days < 7) return `منذ ${days} أيام`;
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { dateStyle: 'medium' }).format(date);
}

/** استخراج أول رسالة خطأ من استجابة Laravel (422 / 401 …) أو Axios */
/** تنزيل ملف من استجابة Axios (blob) — مفيد لتصدير Excel من الـ API */
export function downloadBlobFromResponse(response, filename) {
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
}

export function getApiErrorMessage(err, fallback = 'حدث خطأ. حاول مرة أخرى.') {
  const data = err?.response?.data;
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }
  const errors = data?.errors;
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat()?.find((m) => typeof m === 'string');
    if (first) return first;
  }
  if (err?.code === 'ECONNABORTED' || /timeout of \d+ms exceeded/i.test(String(err?.message || ''))) {
    return 'الطلب أخذ وقت أطول من المتوقع. خلّي الصفحة مفتوحة وحاول مرة ثانية.';
  }
  if (typeof err?.message === 'string' && err.message && !err.message.startsWith('Request failed')) {
    return err.message;
  }
  return fallback;
}
