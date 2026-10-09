import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import NavigationHistory from "@/components/NavigationHistory";
import { AIConfigProvider } from "@/components/AIConfigProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "@/components/CookieConsent";

const deploymentUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: {
    default: "ByteShelf — Your shelf of useful tech",
    template: "%s | ByteShelf",
  },
  description:
    "A searchable, growing library of useful tech tools, tips, websites, apps, commands, and learning resources — discovered once, explained clearly, kept up to date.",
  keywords: [
    "tech tools",
    "developer resources",
    "windows tips",
    "useful websites",
    "ai tools",
    "browser extensions",
    "student resources",
    "tech library",
  ],
  authors: [{ name: "ByteShelf" }],
  creator: "ByteShelf",
  // Public site — indexable. Auth-gated pages get noindex via their own metadata.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-512.png",
  },
  openGraph: {
    type: "website",
    siteName: "ByteShelf",
    title: "ByteShelf — Your shelf of useful tech",
    description:
      "A searchable library of useful tech tools, tips, websites, apps, commands, and learning resources.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ByteShelf — Your shelf of useful tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ByteShelf — Your shelf of useful tech",
    description:
      "A searchable library of useful tech tools, tips, websites, apps, commands, and learning resources.",
  },
  verification: {
    google: "google2500a0ac0fe3156d",
  },
};

export const viewport: Viewport = {
  themeColor: "#4361ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <NavigationHistory />
        <ToastProvider>
          <AIConfigProvider>{children}</AIConfigProvider>
        </ToastProvider>
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  );
}
