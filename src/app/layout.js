import { Cairo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "@/styles/theme.css";
import Providers from "./providers";
import { DEFAULT_BRAND_LOGO } from "@/lib/brand";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
  themeColor: "#214a6d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} min-h-dvh`}>
      <body
        className={`${cairo.className} min-h-dvh flex flex-col bg-background font-sans text-foreground antialiased`}
      >
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
