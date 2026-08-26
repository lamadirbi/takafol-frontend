import Script from "next/script";
import "./globals.css";
import "@/styles/theme.css";
import Providers from "./providers";
import { DEFAULT_BRAND_LOGO } from "@/lib/brand";

export const metadata = {
  title: "تَكافل",
  description: "نعمل معاً لتنظيم المساعدات بكرامة وشفافية وأمل",
  applicationName: "تَكافل",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: DEFAULT_BRAND_LOGO, sizes: "192x192", type: "image/png" }],
    apple: [{ url: DEFAULT_BRAND_LOGO, sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "تَكافل",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#1877F2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="min-h-dvh">
      <body className="min-h-dvh flex flex-col bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
        <Script
          id="pwa-install-capture"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
