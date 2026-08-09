import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { GlobalAudioPlayer } from "@/components/audio/global-audio-player";
import { SiteNav } from "@/components/navigation/site-nav";
import { SkipLink } from "@/components/ui/skip-link";
import { Providers } from "@/providers/providers";
import { siteConfig } from "@/lib/site";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-app-sans",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo/app-icon.png",
    apple: "/icons/app-icon.png",
  },
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/images/app-feature.png",
        width: 1024,
        height: 500,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/images/app-feature.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Application localization — resolve the persisted locale (cookie) and its
  // message catalog for SSR + client components.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${notoSansDevanagari.variable} ${geistMono.variable} font-sans`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <SkipLink />
          <Providers>
            <SiteNav />
            {children}
            <GlobalAudioPlayer />
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
