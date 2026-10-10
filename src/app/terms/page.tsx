import type { Metadata } from "next";
import { PublicPage } from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for using ByteShelf.",
};

const termsContent = {
  slug: "terms",
  title: "Terms of Service",
  eyebrow: "Legal",
  description: "Rules and guidelines for using ByteShelf, contributing content, and interacting with the community.",
  sections: [
    {
      title: "Acceptance of Terms",
      body: [
        "By accessing and using ByteShelf, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
        "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.",
      ],
    },
    {
      title: "Description of Service",
      body: [
        "ByteShelf is a community-built public library of useful technology tools, tips, commands, websites, apps, guides, and workflows. The service allows users to discover entries, contribute new entries, and participate in the review and moderation process.",
        "We reserve the right to modify, suspend, or discontinue the service at any time without notice, though we will strive to communicate significant changes to our users.",
      ],
    },
    {
      title: "User Accounts and Authentication",
      body: [
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.",
        "You must be at least 13 years old to create an account. By creating an account, you represent that you meet this age requirement.",
      ],
    },
    {
      title: "Content Submission and Moderation",
      body: [
        "You retain ownership of content you submit to ByteShelf. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the service.",
        "All submissions are subject to review by moderators before publication. We reserve the right to reject or remove content that violates our guidelines, is inaccurate, or does not meet our quality standards.",
        "You agree not to submit content that is illegal, abusive, harmful, infringes on intellectual property rights, or violates the privacy of others.",
      ],
    },
    {
      title: "User Conduct",
      body: [
        "You agree to use ByteShelf for its intended purpose: building a useful, respectful community knowledge base. Prohibited conduct includes harassment, spam, malicious submissions, and attempts to disrupt the service.",
        "We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.",
      ],
    },
    {
      title: "Intellectual Property",
      body: [
        "You represent that you have the right to submit any content you post to ByteShelf and that your submissions do not infringe on the intellectual property rights of others.",
        "If you believe your intellectual property has been used without authorization, please use our contact form to report the issue.",
      ],
    },
    {
      title: "Disclaimer of Warranties",
      body: [
        "ByteShelf is provided as is without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.",
        "Technical commands, snippets, and tools in the library are user-generated. Use them at your own risk and verify commands before running them, especially in production environments.",
      ],
    },
    {
      title: "Limitation of Liability",
      body: [
        "In no event shall ByteShelf or its operators be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service, including but not limited to data loss or system damage.",
      ],
    },
    {
      title: "Governing Law",
      body: [
        "These terms are governed by the laws of the jurisdiction in which ByteShelf operates. Any disputes arising from these terms shall be resolved through the applicable legal system.",
      ],
    },
  ],
};

export default function TermsPage() {
  return <PublicPage page={termsContent} />;
}
