import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { SkipLink } from "@/components/ui/skip-link";
import { Providers } from "@/providers/providers";
import { siteConfig } from "@/lib/site";
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
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ne"
      suppressHydrationWarning
      className={`${notoSansDevanagari.variable} ${geistMono.variable} font-sans`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
