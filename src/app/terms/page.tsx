import type { Metadata } from "next";
import BackLink from "@/components/BackLink";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for invited users of the Tech-Utility private knowledge library.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <BackLink href="/login">Back to sign in</BackLink>
      <h1>Terms of use</h1>
      <p>Draft terms for the private, owner-provisioned Tech-Utility app.</p>
      <aside className="legal-draft-notice" role="note">
        These draft terms are not legal advice. Before inviting users, add the owner&apos;s legal
        identity, contact details, and governing jurisdiction, and have the terms reviewed for
        the users&apos; jurisdictions.
      </aside>
      <h2>Access and account security</h2>
      <p>
        Access is invitation-only and may be disabled or expire. Keep credentials private and
        notify the owner if you suspect an account was accessed without permission. Do not share
        an account or attempt to access another user&apos;s records.
      </p>
      <h2>Your content</h2>
      <p>
        You remain responsible for the content, links, images, and commands you save. Only add
        material you have the right to store and use. Review AI-generated drafts before saving;
        the app does not guarantee that generated content is accurate or safe.
      </p>
      <h2>Service and payments</h2>
      <p>
        The current app has no checkout, subscription, or paid plan. It is provided as a
        private tool and may change or be unavailable. No payment or refund terms apply to the
        current version.
      </p>
      <h2>Account closure</h2>
      <p>
        Signed-in users can request permanent deletion of their Tech-Utility account, library data,
        and uploaded images from Settings by entering the signed-in account&apos;s email as
        confirmation. This action cannot be undone. If deletion reports an error, contact the
        owner before retrying because uploaded files may already have been removed. Hosting and
        service-provider backups may retain data according to their own retention schedules.
      </p>
    </main>
  );
}
