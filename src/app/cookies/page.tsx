import type { Metadata } from "next";
import { PublicPage } from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookie and browser storage information for ByteShelf.",
};

const cookiesContent = {
  slug: "cookies",
  title: "Cookies and Browser Storage",
  eyebrow: "Privacy",
  description: "Information about cookies, local storage, and data retention in your browser.",
  sections: [
    {
      title: "Essential Cookies",
      body: [
        "Supabase Auth uses cookies to maintain your signed-in session. These cookies are necessary for account access and authentication. They are not used for advertising or analytics.",
        "Essential cookies cannot be disabled without affecting the core functionality of the service.",
      ],
    },
    {
      title: "Local Storage",
      body: [
        "ByteShelf may store the selected AI provider and optional user-entered provider API keys in browser local storage. These are not cookies and are held only in your browser tab.",
        "API keys stored in local storage are not synced across devices and are cleared when you clear your browser data. Avoid saving API keys on shared or public devices.",
        "You can clear local storage through your browser settings or through the Settings page in ByteShelf.",
      ],
    },
    {
      title: "Consent",
      body: [
        "ByteShelf currently does not include analytics, advertising, or other optional cookie categories. Therefore, we do not display a cookie consent banner.",
        "If we introduce optional tracking or third-party widgets in the future, we will provide clear consent options and controls before activating them.",
      ],
    },
    {
      title: "Third-Party Services",
      body: [
        "ByteShelf uses third-party services (Supabase for authentication and database, Vercel for hosting) that may set their own cookies. These are governed by the respective privacy policies of those services.",
      ],
    },
  ],
};

export default function CookiesPage() {
  return <PublicPage page={cookiesContent} />;
}
