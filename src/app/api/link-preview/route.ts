import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  url: string;
}

function extractMeta(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawUrl = body.url;
  if (!rawUrl || typeof rawUrl !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Ash-Tech-Bot/1.0; +https://ash-tech.vercel.app)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ url: rawUrl, error: "Could not fetch page" }, { status: 200 });
    }

    const html = await res.text();

    const preview: LinkPreviewData = {
      url: res.url ?? rawUrl,
      title: extractMeta(html, "title") ?? extractTitle(html),
      description: extractMeta(html, "description") ?? extractMeta(html, "description"),
      image: extractMeta(html, "image"),
      favicon: `${url.origin}/favicon.ico`,
    };

    return NextResponse.json(preview);
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError"
      ? "Request timed out"
      : "Could not fetch preview";
    return NextResponse.json({ url: rawUrl, error: msg }, { status: 200 });
  }
}
