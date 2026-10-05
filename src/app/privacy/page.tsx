import type { Metadata } from "next";
import BackLink from "@/components/BackLink";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Learn what Tech-Utility stores and how account, library, and AI autofill data is handled.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <BackLink href="/login">Back to sign in</BackLink>
      <h1>Privacy</h1>
      <p>Draft privacy information for the private Tech-Utility knowledge library.</p>
      <aside className="legal-draft-notice" role="note">
        Before inviting users, the owner must add a real contact address, identify the applicable
        data controller and jurisdictions, and have this notice reviewed for local law.
      </aside>

      <h2>Information the app stores</h2>
      <p>
        Sign-in is provided by Supabase Auth and the enabled Google or GitHub provider. The app
        stores account identifiers, the email and profile fields returned by the provider, and
        knowledge entries, categories, links, timestamps, and uploaded images that users add.
        Email/password users may request account-recovery messages through the configured
        Supabase Auth email provider.
      </p>
      <h2>AI autofill</h2>
      <p>
        AI autofill is optional. When used, the text submitted for drafting and the selected
        provider key are sent to this app&apos;s authenticated server endpoint and then to the
        configured AI provider. Provider terms and privacy policies also apply. The key is held
        in browser memory only, is not intentionally written to browser storage, and is cleared
        on page reload or sign-out. Custom OpenAI-compatible endpoints must use public HTTPS.
      </p>
      <h2>Cookies and storage</h2>
      <p>
        Authentication requires session cookies. The app does not currently use analytics or
        advertising cookies. AI provider, model, and custom endpoint preferences may be stored
        in browser local storage; API keys are not stored there.
      </p>
      <h2>Hosting and retention</h2>
      <p>
        App hosting is provided by Vercel and account, database, and image storage by Supabase.
        Deleting an entry moves it to Trash; no automatic purge schedule is configured, so it
        remains until restored or separately removed. JSON export does not include image file
        bytes.
      </p>
      <h2>Your choices</h2>
      <p>
        Users can export their library from Settings, clear the in-memory AI key, and request
        permanent deletion of their account, library
        data, and uploaded images from Settings by entering the signed-in account&apos;s email as
        confirmation. Deletion is performed by the app&apos;s configured Supabase project.
        Provider backups may retain data under their own retention schedules; this draft notice
        needs provider-specific retention periods and local legal review before inviting users.
      </p>
    </main>
  );
}
