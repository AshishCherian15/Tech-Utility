import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "Ash-Tech — Your Private Tech Memory",
    template: "%s | Ash-Tech",
  },
  description:
    "A private, searchable knowledge base for tips, tricks, hacks, apps, commands, tools and prompts — the things you find once and shouldn't have to Google again.",
  keywords: ["personal knowledge base", "tech tips", "commands", "bookmarks", "tech memory"],
  authors: [{ name: "Ash" }],
  creator: "Ash",
  robots: "noindex, nofollow",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#080c14",
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
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

