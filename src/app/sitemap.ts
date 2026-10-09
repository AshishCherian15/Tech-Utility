import type { MetadataRoute } from "next";
import { publicPageLinks, legalPageLinks } from "@/lib/public-page-content";

const deploymentUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = deploymentUrl;
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...[...publicPageLinks, ...legalPageLinks, { href: "/refund-policy", label: "Refund Policy" }]
      .map((link) => ({
        url: `${base}${link.href}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if status column exists (backward compatibility)
    let hasStatusColumn = false;
    try {
      const { error: statusCheckError } = await supabase
        .from("entries")
        .select("status")
        .limit(1);
      hasStatusColumn = !statusCheckError;
    } catch {
      hasStatusColumn = false;
    }

    let query = supabase
      .from("entries")
      .select("id, updated_at")
      .is("deleted_at", null);

    if (hasStatusColumn) {
      query = query.eq("status", "PUBLISHED");
    }

    const { data: entries } = await query;

    if (entries) {
      entries.forEach((entry) => {
        sitemapEntries.push({
          url: `${base}/entry/${entry.id}`,
          lastModified: new Date(entry.updated_at),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    }
  }

  return sitemapEntries;
}
