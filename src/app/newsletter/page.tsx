import type { Metadata } from "next";
import { PublicPage } from "@/components/PublicPage";
import { publicPages } from "@/lib/public-page-content";

const page = publicPages.newsletter;

export const metadata: Metadata = { title: page.title, description: page.description };

export default function NewsletterPage() {
  return <PublicPage page={page} />;
}
