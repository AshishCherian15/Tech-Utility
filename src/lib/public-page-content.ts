export interface PublicPageSection {
  title: string;
  body: string[];
  bullets?: string[];
}

export interface PublicPageContent {
  slug: string;
  title: string;
  description: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  sections: PublicPageSection[];
}

export const publicPages: Record<string, PublicPageContent> = {
  about: {
    slug: "about",
    title: "About ByteShelf",
    eyebrow: "Company",
    description: "ByteShelf is a community-built library for useful tech tools, tips, commands, websites, and workflows.",
    ctaLabel: "Start contributing",
    ctaHref: "/login",
    sections: [
      {
        title: "Our Mission",
        body: [
          "ByteShelf helps people stop rediscovering the same useful technology over and over. The product is built around short, practical entries that explain what something is, why it matters, and when to use it.",
          "The library is reviewed before publication so contributors can share helpful discoveries without turning the site into a noisy bookmark dump.",
        ],
      },
      {
        title: "What We Value",
        body: ["Every entry should be useful, specific, and honest about its limits."],
        bullets: [
          "Clear explanations over marketing copy.",
          "Human review before public publication.",
          "Accessibility, privacy, and security as product requirements.",
          "Practical examples that help readers decide quickly.",
        ],
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    eyebrow: "Support",
    description: "Get help with ByteShelf, report a problem, or send feedback about the public library.",
    sections: [
      {
        title: "Support Channels",
        body: ["Use these channels for account help, content concerns, accessibility feedback, and security reports."],
        bullets: [
          "Support email: support@byteshelf.app",
          "Security email: security@byteshelf.app",
          "Business phone: Contact information will be added when a business line is established.",
          "Social media: Official profiles will be linked when they are launched.",
        ],
      },
      {
        title: "Before You Send",
        body: [
          "Include the affected page URL, your account email if relevant, screenshots if helpful, and the steps that reproduce the issue. Do not send passwords or API keys.",
        ],
      },
    ],
  },
  consent: {
    slug: "consent",
    title: "Consent and Data Choices",
    eyebrow: "Privacy",
    description: "Understand what ByteShelf needs to operate and which choices you control.",
    sections: [
      {
        title: "Essential Processing",
        body: [
          "ByteShelf processes account, session, and submitted-content data to operate the service. This processing is necessary for authentication, moderation, publication, and account security.",
        ],
      },
      {
        title: "Optional Processing",
        body: ["Analytics, marketing emails, and third-party widgets are not currently enabled. When these features are added, we will provide clear consent options and controls."],
        bullets: [
          "You may decline non-essential cookies.",
          "You may request deletion through account settings.",
          "You may unsubscribe from future newsletters when email features are enabled.",
        ],
      },
    ],
  },
  refund: {
    slug: "refund",
    title: "Refund and Return Policy",
    eyebrow: "Billing",
    description: "ByteShelf does not currently sell paid services, physical goods, or subscriptions.",
    sections: [
      {
        title: "Current Status",
        body: [
          "ByteShelf is currently a free public-library and contributor product. Because no payments are collected by the app today, there are no refunds or returns to process.",
        ],
      },
      {
        title: "Future Paid Plans",
        body: [
          "When paid services are introduced, this page will include pricing, billing terms, cancellation rules, and refund windows before checkout is enabled.",
        ],
      },
    ],
  },
  faq: {
    slug: "faq",
    title: "FAQ and Help Center",
    eyebrow: "Help",
    description: "Answers to common questions about browsing, contributing, review, accounts, and privacy.",
    sections: [
      {
        title: "Using ByteShelf",
        body: ["ByteShelf is a searchable library of practical technology entries."],
        bullets: [
          "Browse published entries without signing in.",
          "Create an account to submit entries for review.",
          "Use the dashboard search and filters to narrow by type, category, difficulty, and platform.",
        ],
      },
      {
        title: "Review and Moderation",
        body: [
          "Contributor submissions may remain pending until a moderator approves them. Rejected entries include a reason explaining the decision.",
        ],
      },
    ],
  },
  blog: {
    slug: "blog",
    title: "Blog and Updates",
    eyebrow: "Updates",
    description: "Product notes, release updates, and editorial guides from ByteShelf.",
    sections: [
      {
        title: "Latest Update",
        body: [
          "ByteShelf is moving from a private tech-memory app toward a public, reviewed library. The next product focus is clean public browsing, contributor review, moderation tools, and security hardening.",
        ],
      },
      {
        title: "Editorial Direction",
        body: [
          "Future posts should highlight useful collections, changelog entries, moderation policies, accessibility updates, and practical technology guides.",
        ],
      },
    ],
  },
  promotions: {
    slug: "promotions",
    title: "Giveaways and Promotions",
    eyebrow: "Community",
    description: "Official ByteShelf promotions, giveaways, and community events.",
    sections: [
      {
        title: "No Active Promotions",
        body: [
          "ByteShelf is not running a giveaway or promotion at this time. Check back later for community events and special features.",
        ],
      },
    ],
  },
  sitemap: {
    slug: "sitemap",
    title: "Sitemap",
    eyebrow: "Navigation",
    description: "A human-readable guide to important ByteShelf pages.",
    sections: [
      {
        title: "Core Pages",
        body: ["Use this page to find important public, legal, account, support, and transparency pages."],
        bullets: [
          "Home, About, Contact, FAQ, Blog",
          "Privacy, Terms, Cookies, Consent, Legal Notices",
          "Accessibility, Changelog, Status, License Compliance",
          "Login, Dashboard, Categories, Settings",
        ],
      },
    ],
  },
  accessibility: {
    slug: "accessibility",
    title: "Accessibility Statement",
    eyebrow: "WCAG",
    description: "ByteShelf aims to provide an accessible experience for keyboard, screen-reader, and low-vision users.",
    sections: [
      {
        title: "Commitment",
        body: [
          "ByteShelf is designed with semantic markup, keyboard focus states, readable contrast, responsive layouts, and reduced-motion fallbacks.",
        ],
      },
      {
        title: "Feedback",
        body: [
          "If you encounter an accessibility barrier, contact support with the page URL, browser, assistive technology, and a short description of the issue.",
        ],
      },
    ],
  },
  "accessibility-help": {
    slug: "accessibility-help",
    title: "Accessibility Help",
    eyebrow: "Help",
    description: "Keyboard, screen reader, and navigation guidance for using ByteShelf.",
    sections: [
      {
        title: "Keyboard Basics",
        body: ["ByteShelf supports standard browser navigation."],
        bullets: [
          "Use Tab and Shift+Tab to move through controls.",
          "Use Enter or Space to activate buttons.",
          "Use Ctrl+K inside the app to open the command palette.",
          "Use browser zoom up to at least 200 percent for larger text.",
        ],
      },
    ],
  },
  pricing: {
    slug: "pricing",
    title: "Pricing",
    eyebrow: "Plans",
    description: "ByteShelf is currently free while the public library and contributor workflows are being shaped.",
    sections: [
      {
        title: "Current Plan",
        body: ["The current ByteShelf app has no paid billing flow."],
        bullets: [
          "Browse public entries for free.",
          "Create an account to contribute entries.",
          "No subscription is required today.",
        ],
      },
      {
        title: "Future Billing",
        body: ["When paid plans are introduced, this page will include pricing tiers, billing cycles, cancellation policies, and refund windows."],
      },
    ],
  },
  testimonials: {
    slug: "testimonials",
    title: "Testimonials and Reviews",
    eyebrow: "Social Proof",
    description: "A space for verified feedback from ByteShelf readers and contributors.",
    sections: [
      {
        title: "Verification Standard",
        body: [
          "Only publish testimonials with permission from the person or organization quoted. Avoid fabricated social proof.",
        ],
      },
    ],
  },
  press: {
    slug: "press",
    title: "Press and Media Kit",
    eyebrow: "Media",
    description: "Brand information, product summary, and media guidance for ByteShelf.",
    sections: [
      {
        title: "Short Description",
        body: [
          "ByteShelf is a reviewed public library of practical technology tips, tools, commands, apps, websites, guides, and prompts.",
        ],
      },
      {
        title: "Brand Assets",
        body: [
          "Use official assets from the repository only. Do not stretch, recolor, or modify the logo without a brand update.",
        ],
      },
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers and Opportunities",
    eyebrow: "Opportunities",
    description: "Information about future roles, collaboration, and community opportunities.",
    sections: [
      {
        title: "Current Openings",
        body: ["There are no formal job openings at this time."],
      },
      {
        title: "Future Needs",
        body: [
          "Future opportunities may include moderation, editorial review, security, accessibility, design, and engineering support.",
        ],
      },
    ],
  },
  community: {
    slug: "community",
    title: "Community",
    eyebrow: "Forum",
    description: "Community guidance for future discussions, feedback, and contributor collaboration.",
    sections: [
      {
        title: "Community Standards",
        body: ["ByteShelf community spaces should stay practical, respectful, and focused on useful technology knowledge."],
        bullets: [
          "No spam or low-effort promotional posts.",
          "Credit original sources where appropriate.",
          "Report unsafe commands, misleading entries, or copied content.",
        ],
      },
    ],
  },
  newsletter: {
    slug: "newsletter",
    title: "Newsletter",
    eyebrow: "Email",
    description: "A future home for ByteShelf updates, curated entries, and product announcements.",
    sections: [
      {
        title: "Not Yet Enabled",
        body: [
          "Newsletter signup is not connected to an email provider yet. Add double opt-in, unsubscribe links, and preference management before collecting subscribers.",
        ],
      },
    ],
  },
  unsubscribe: {
    slug: "unsubscribe",
    title: "Unsubscribe and Preferences",
    eyebrow: "Email Preferences",
    description: "Manage future newsletter and product email preferences.",
    sections: [
      {
        title: "Email Controls",
        body: [
          "Marketing email is not currently enabled. When newsletters launch, every email must include an unsubscribe link and a preferences page.",
        ],
      },
    ],
  },
  "legal-notices": {
    slug: "legal-notices",
    title: "Legal Notices",
    eyebrow: "Legal",
    description: "Additional disclaimers, limitations, and notices for ByteShelf.",
    sections: [
      {
        title: "User-Generated Content",
        body: [
          "Entries may include user-generated commands, links, and instructions. Review technical commands before running them, especially when they affect files, credentials, accounts, or system settings.",
        ],
      },
      {
        title: "No Professional Advice",
        body: [
          "ByteShelf content is informational and does not replace professional security, legal, financial, or technical advice.",
        ],
      },
    ],
  },
  changelog: {
    slug: "changelog",
    title: "Version and Changelog",
    eyebrow: "Release Notes",
    description: "Track visible product updates and reliability improvements.",
    sections: [
      {
        title: "Current Focus",
        body: [
          "The current implementation focuses on public library pages, contributor workflows, compliance pages, and cleaner verification through lint/build.",
        ],
      },
    ],
  },
  "data-retention": {
    slug: "data-retention",
    title: "Data Retention Policy",
    eyebrow: "Privacy",
    description: "How long ByteShelf keeps account, content, and operational data.",
    sections: [
      {
        title: "Account and Content Data",
        body: [
          "Account and submitted content are retained while the account is active. Deleted account workflows should remove user-owned content and private uploaded images where technically possible.",
        ],
      },
      {
        title: "Operational Logs",
        body: [
          "Hosting, authentication, and database providers may retain logs according to their own retention policies. Document exact periods before production launch.",
        ],
      },
    ],
  },
  license: {
    slug: "license",
    title: "License Compliance",
    eyebrow: "Open Source",
    description: "Open-source attribution and licensing posture for ByteShelf.",
    sections: [
      {
        title: "Project License",
        body: [
          "The repository includes an MIT license. Runtime dependencies should be reviewed before production release to ensure license compatibility.",
        ],
      },
      {
        title: "Attribution",
        body: [
          "Keep notices for third-party packages, icon libraries, frameworks, and generated assets where required by their licenses.",
        ],
      },
    ],
  },
  status: {
    slug: "status",
    title: "Status",
    eyebrow: "Uptime",
    description: "A public status placeholder for uptime and incident communication.",
    sections: [
      {
        title: "Current Status",
        body: ["No automated status provider is connected yet."],
        bullets: [
          "App availability should be monitored in production.",
          "Incidents should include start time, impact, updates, and resolution.",
          "A dedicated provider can be added later for live uptime checks.",
        ],
      },
    ],
  },
  "bug-bounty": {
    slug: "bug-bounty",
    title: "Bug Bounty and Security Reporting",
    eyebrow: "Security",
    description: "How to report security issues responsibly.",
    sections: [
      {
        title: "Responsible Disclosure",
        body: [
          "If you find a vulnerability, report it privately to security@byteshelf.app with steps to reproduce and potential impact. Do not access other users' data, disrupt service, or publish details before remediation.",
        ],
      },
      {
        title: "Bounty Status",
        body: [
          "ByteShelf does not currently operate a paid bounty program. Recognition or rewards may be introduced later.",
        ],
      },
    ],
  },
};

export const publicPageLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Updates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/sitemap", label: "Sitemap" },
  { href: "/status", label: "Status" },
];

export const legalPageLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/consent", label: "Consent" },
  { href: "/legal-notices", label: "Legal Notices" },
  { href: "/data-retention", label: "Data Retention" },
  { href: "/license", label: "License" },
  { href: "/bug-bounty", label: "Security" },
];
