import type { Metadata } from "next";
import { PublicPage } from "@/components/PublicPage";
import { publicPages } from "@/lib/public-page-content";

const page = publicPages["bug-bounty"];

export const metadata: Metadata = { title: page.title, description: page.description };

export default function BugBountyPage() {
  return <PublicPage page={page} />;
}
