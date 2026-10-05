import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import NavigationHistory from "@/components/NavigationHistory";
import { AIConfigProvider } from "@/components/AIConfigProvider";

const deploymentUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: {
    default: "Tech-Utility — Your Private Tech Library",
    template: "%s | Tech-Utility",
  },
  description:
    "A private, searchable knowledge base for tips, tricks, hacks, apps, commands, tools and prompts — the things you find once and shouldn't have to Google again.",
  keywords: ["personal knowledge base", "tech tips", "commands", "bookmarks", "tech memory"],
  authors: [{ name: "Ash" }],
  creator: "Ash",
  robots: "noindex, nofollow",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/tech-utility-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: "/tech-utility-icon.svg",
  },
  openGraph: {
    type: "website",
    title: "Tech-Utility — Your Private Tech Library",
    description: "A private, searchable knowledge base for your technical discoveries.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Tech-Utility private tech library" }],
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
      </body>
    </html>
  );
}
