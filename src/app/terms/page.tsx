import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for ByteShelf.",
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Terms of Service</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</p>
      
      <div style={{ color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p>By accessing and using ByteShelf, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>2. Description of Service</h2>
          <p>ByteShelf is a knowledge base platform for sharing technical tips, commands, and discoveries. We reserve the right to modify, suspend, or discontinue the service at any time without notice.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>3. User Conduct and Content</h2>
          <p>You are solely responsible for any content you post on ByteShelf. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the service.</p>
          <p style={{ marginTop: 12 }}>You agree not to post content that is illegal, abusive, or infringes on the intellectual property rights of others. We reserve the right to remove any content or terminate accounts at our sole discretion.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>4. Disclaimer of Warranties</h2>
          <p>ByteShelf is provided &quot;as is&quot; without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free. The snippets and commands on this platform are user-generated; use them at your own risk.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>5. Limitation of Liability</h2>
          <p>In no event shall ByteShelf or its operators be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.</p>
        </section>
      </div>
    </div>
  );
}
