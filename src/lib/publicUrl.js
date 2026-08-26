export function campPublicPath(slug) {
  const s = String(slug || '').replace(/^\/+/, '');
  return s ? `/${s}` : '/';
}

export function campPublicUrl(slug, origin = '') {
  const path = campPublicPath(slug);
  const base = String(origin || '').replace(/\/+$/, '');
  return base ? `${base}${path}` : path;
}
