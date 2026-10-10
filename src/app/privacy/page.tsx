import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for ByteShelf.",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Last updated: October 10, 2026</p>
      
      <div style={{ color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, update your profile, or submit content to ByteShelf. This may include your name, email address, and any information contained in the content you submit.</p>
          <p style={{ marginTop: 12 }}>We also automatically collect certain information about your device and how you interact with our service, including IP addresses, browser types, and usage data, through the use of cookies and similar technologies.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services. This includes authenticating users, processing and publishing your submissions, and communicating with you about your account or our services.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>3. Information Sharing</h2>
          <p>The content you submit to ByteShelf (such as tips, commands, and comments) is intended for public consumption and will be visible to other users. We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf (e.g., hosting providers like Vercel and Supabase).</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>4. Data Security</h2>
          <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet transmission is completely secure, and we cannot guarantee the absolute security of your data.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>5. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. You can manage most of your information through your account settings or by contacting us.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>6. Data Retention</h2>
          <p>We retain your personal information only as long as necessary to provide our services. When you delete your account, we will delete your personal data within 30 days, except where required by law to retain certain records.</p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>7. Privacy Grievances</h2>
          <p>If you have concerns about how your personal data is handled, or if you believe your privacy rights have been violated, you may submit a grievance to our Data Protection Officer.</p>
          <p style={{ marginTop: 12 }}>
            <strong> grievance-officer@byteshelftech.vercel.app</strong>
          </p>
          <p style={{ marginTop: 8 }}>
            Alternatively, use our <Link href="/contact" style={{ color: "var(--text-accent)" }}>contact form</Link> to submit your grievance.
          </p>
          <p style={{ marginTop: 8 }}>
            We will acknowledge receipt of your grievance within 14 days and provide a response within 30 days of receipt, unless the complexity of the matter requires additional time.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>8. Contact Us</h2>
          <p>For privacy-related questions, data requests, or grievances, please contact us through our <Link href="/contact" style={{ color: "var(--text-accent)" }}>contact page</Link>.</p>
        </section>
      </div>
    </div>
  );
}
