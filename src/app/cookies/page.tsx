import type { Metadata } from "next";
import BackLink from "@/components/BackLink";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookie and browser storage information for ByteShelf.",
};

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <BackLink href="/login">Back to sign in</BackLink>
      <h1>Cookies and browser storage</h1>
      <h2>Essential cookies</h2>
      <p>
        Supabase Auth uses cookies to maintain the signed-in session. These are necessary for
        account access and are not used by this app for advertising or analytics.
      </p>
      <h2>Local storage</h2>
      <p>
        The app may store the selected AI provider and optional user-entered provider API keys
        in browser local storage. These are not cookies. Clear them in Settings or the browser
        storage controls, and avoid saving keys on shared devices.
      </p>
      <h2>Consent</h2>
      <p>
        The current app does not include analytics, advertising, or other optional cookie
        categories, so it does not display a consent banner. Reassess this if optional tracking
        or third-party widgets are introduced.
      </p>
    </main>
  );
}
