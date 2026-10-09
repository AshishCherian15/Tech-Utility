import type { MetadataRoute } from "next";

const deploymentUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/review-queue", "/dashboard", "/entries/new", "/settings", "/users", "/trash", "/favorites"],
      },
    ],
    sitemap: new URL("/sitemap.xml", deploymentUrl).toString(),
  };
}
