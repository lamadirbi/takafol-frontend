/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
let backendHost = '127.0.0.1';
let backendPort = '';
let backendProtocol = 'http';
try {
  const parsed = new URL(backend);
  backendHost = parsed.hostname;
  backendPort = parsed.port;
  backendProtocol = parsed.protocol.replace(':', '');
} catch {
  /* keep defaults */
}

function storagePatternFromUrl(raw) {
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: '/storage/**',
    };
  } catch {
    return null;
  }
}

const storagePatterns = [
  {
    protocol: backendProtocol,
    hostname: backendHost,
    ...(backendPort ? { port: backendPort } : {}),
    pathname: '/storage/**',
  },
  storagePatternFromUrl(process.env.NEXT_PUBLIC_SITE_URL),
].filter(Boolean);

const clickjackingHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
];

const nextConfig = {
  compress: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: clickjackingHeaders,
      },
    ];
  },
  allowedDevOrigins: [
    '10.220.3.135',
    '*.loca.lt',
    '*.localtunnel.me',
    '*.trycloudflare.com',
    '*.ngrok-free.app',
    '*.ngrok.io',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: storagePatterns,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${backend}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
