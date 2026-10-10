import type { Metadata } from "next";
import { PublicPage } from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ByteShelf collects, uses, and protects your data.",
};

const privacyContent = {
  slug: "privacy",
  title: "Privacy Policy",
  eyebrow: "Legal",
  description: "How ByteShelf collects, uses, and protects your personal information and submitted content.",
  sections: [
    {
      title: "Information We Collect",
      body: [
        "We collect information you provide directly when you create an account, update your profile, or submit content to ByteShelf. This includes your name, email address, and any information contained in your submissions (titles, descriptions, commands, links, tags, images).",
        "We automatically collect technical information about your device and interaction with our service, including IP addresses, browser types, and usage patterns through cookies and similar technologies for authentication and analytics.",
      ],
    },
    {
      title: "How We Use Your Information",
      body: [
        "We use your information to provide, maintain, and improve ByteShelf. This includes authenticating users, processing and publishing your submissions under the review queue system, and communicating with you about your account or service updates.",
        "Submitted content (entries, categories, tags) is reviewed by moderators before publication to ensure quality and accuracy. Your user identity is associated with your submissions for attribution and review purposes.",
      ],
    },
    {
      title: "Information Sharing",
      body: [
        "Content you submit to ByteShelf (tips, commands, guides, links) is intended for public consumption and will be visible to other users once approved by moderators. Published entries are publicly accessible.",
        "We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as Vercel (hosting) and Supabase (database and authentication). These providers are bound by data protection obligations.",
      ],
    },
    {
      title: "Data Security",
      body: [
        "We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption in transit, secure authentication, and role-based access controls.",
        "No internet transmission is completely secure. While we strive to protect your data, we cannot guarantee absolute security against all threats.",
      ],
    },
    {
      title: "Your Rights",
      body: [
        "You have the right to access, correct, or delete your personal data. You can manage your account information through the Settings page, including deleting your account and associated data.",
        "You can request a copy of your data or request deletion through account settings or by contacting us. Content you submitted to the public library may remain in the library after account deletion if it has been published and is useful to the community.",
      ],
    },
    {
      title: "Data Retention",
      body: [
        "We retain your personal information only as long as necessary to provide our services. Account data is retained while your account is active. When you delete your account, we will delete your personal data within 30 days, except where required by law to retain certain records.",
        "Published entries you submitted may remain in the public library even after account deletion to preserve the usefulness of the library for other users, as contributions are made to the community.",
      ],
    },
    {
      title: "Privacy Grievances",
      body: [
        "If you have concerns about how your personal data is handled, or if you believe your privacy rights have been violated, you may submit a grievance to our Data Protection Officer.",
      ],
      bullets: [
        "Email: privacy@byteshelf.app",
        "Alternatively, use our contact form to submit your grievance.",
        "We will acknowledge receipt within 14 days and provide a response within 30 days, unless complexity requires additional time.",
      ],
    },
    {
      title: "Content Moderation and Removal",
      body: [
        "ByteShelf operates a review queue system where moderators evaluate submissions before publication. Content that violates our guidelines may be rejected or removed. Rejected entries include a reason explaining the decision.",
        "You retain attribution for your published entries. If an entry is removed for policy violations, the content will be deleted from public view, but the deletion record may be retained for moderation purposes.",
      ],
    },
    {
      title: "Contact Us",
      body: [
        "For privacy-related questions, data requests, grievances, or to exercise your rights, please contact us through our contact page or directly at privacy@byteshelf.app.",
      ],
    },
  ],
};

export default function PrivacyPage() {
  return <PublicPage page={privacyContent} />;
}
