import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // This is an authenticated private app; it has no pages intended for search indexing.
  return [];
}
