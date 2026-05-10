import { NextResponse } from 'next/server';

const DEFAULT_CAMP = process.env.NEXT_PUBLIC_DEFAULT_CAMP_SLUG || 'taiba';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - icon.png, apple-icon.png, favicon.ico, manifest.json, sw.js (public files)
     */
    '/((?!api|_next/static|_next/image|icon.png|apple-icon.png|taibaLogo.png|favicon.ico|manifest.json|sw.js).*)',
  ],
};

export default function proxy(req) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. camp1.localhost:3000)
  const hostname = req.headers.get('host') || 'localhost:3000';

  // Extract subdomain
  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // Check if we are on the main root domain (no subdomain)
  const isRootDomain =
    hostname === 'localhost:3000' || hostname === '127.0.0.1:3000' || hostname === 'taiba.com';

  if (isRootDomain) {
    const p = url.pathname;
    /** مسارات قديمة بدون {campSlug} — إعادة توجيه للمخيم الافتراضي */
    const legacy = [
      [/^\/login\/?$/, `/${DEFAULT_CAMP}/login`],
      [/^\/login\/admin\/?$/, `/${DEFAULT_CAMP}/login/admin`],
      [/^\/dashboard\/?$/, `/${DEFAULT_CAMP}/family/dashboard`],
      [/^\/admin\/?$/, `/${DEFAULT_CAMP}/admin/dashboard`],
      [/^\/admin\/dashboard\/?$/, `/${DEFAULT_CAMP}/admin/dashboard`],
      [/^\/admin\/families\/?$/, `/${DEFAULT_CAMP}/admin/families`],
      [/^\/admin\/filter\/?$/, `/${DEFAULT_CAMP}/admin/filter`],
      [/^\/admin\/camp-records\/?$/, `/${DEFAULT_CAMP}/admin/camp-records`],
      [/^\/admin\/admins\/?$/, `/${DEFAULT_CAMP}/admin/admins`],
      [/^\/news\/?$/, `/${DEFAULT_CAMP}/news`],
    ];
    for (const [re, dest] of legacy) {
      if (re.test(p)) {
        return NextResponse.redirect(new URL(dest + url.search, req.url));
      }
    }
    const m = p.match(/^\/admin\/camp-records\/(\d+)\/?$/);
    if (m) {
      return NextResponse.redirect(
        new URL(`/${DEFAULT_CAMP}/admin/camp-records/${m[1]}${url.search}`, req.url)
      );
    }
    return NextResponse.next();
  }

  // Get the first part of the hostname
  const subdomain = hostname.split('.')[0];

  // Rewrite to the specific camp directory
  return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
}

