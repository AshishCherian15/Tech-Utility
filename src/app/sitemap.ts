import type { MetadataRoute } from "next";

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
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: entries } = await supabase
      .from("entries")
      .select("id, updated_at")
      .eq("status", "PUBLISHED")
      .is("deleted_at", null);

    if (entries) {
      entries.forEach((entry) => {
        sitemapEntries.push({
          url: `${base}/entries/${entry.id}`,
          lastModified: new Date(entry.updated_at),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    }
  }

  return sitemapEntries;
}
