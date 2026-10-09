import type { Metadata } from "next";
import { PublicPage } from "@/components/PublicPage";
import { publicPages } from "@/lib/public-page-content";

const page = publicPages.contact;

export const metadata: Metadata = { title: page.title, description: page.description };

export default function ContactPage() {
  return <PublicPage page={page} />;
}
