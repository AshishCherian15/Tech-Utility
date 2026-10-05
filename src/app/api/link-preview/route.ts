import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { isIP, type LookupFunction } from "node:net";
import { request as httpsRequest } from "node:https";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/validation/json";
import { z } from "zod";

const MAX_RESPONSE_BYTES = 1024 * 1024;
const MAX_PREVIEW_REQUEST_BYTES = 4 * 1024;
const REQUEST_TIMEOUT_MS = 8000;
const DNS_TIMEOUT_MS = 4000;
const linkPreviewRequestSchema = z.object({
  url: z.string().trim().min(1).max(2048),
}).strict();

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  url: string;
}

interface ResolvedAddress {
  address: string;
  family: number;
}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [a, b, c] = octets;
  if (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  ) {
    return false;
  }

  return true;
}

function isPublicIpv6(address: string): boolean {
  if (address.includes("%")) return false;

  const halves = address.toLowerCase().split("::");
  if (halves.length > 2) return false;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];

  if (address.includes(".")) {
    const lastColon = address.lastIndexOf(":");
    const ipv4 = address.slice(lastColon + 1);
    if (!isPublicIpv4(ipv4)) return false;
    const octets = ipv4.split(".").map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    if (right.length > 0) right.splice(right.length - 1, 1, high, low);
    else left.splice(left.length - 1, 1, high, low);
  }

  const missingGroups = 8 - left.length - right.length;
  if ((halves.length === 1 && missingGroups !== 0) || (halves.length === 2 && missingGroups < 1)) {
    return false;
  }

  const groups = [...left, ...Array(missingGroups).fill("0"), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[\da-f]{1,4}$/.test(group))) {
    return false;
  }

  const numericGroups = groups.map((group) => Number.parseInt(group, 16));
  const globalUnicast = numericGroups[0] >= 0x2000 && numericGroups[0] <= 0x3fff;
  const protocolAssignments = numericGroups[0] === 0x2001 && numericGroups[1] <= 0x01ff;
  const sixToFour = numericGroups[0] === 0x2002;
  const documentation =
    (numericGroups[0] === 0x2001 && numericGroups[1] === 0x0db8) ||
    (numericGroups[0] === 0x3fff && (numericGroups[1] & 0xf000) === 0);

  return globalUnicast && !protocolAssignments && !sixToFour && !documentation;
}

function isPublicAddress(address: string, family: number): boolean {
  return family === 4
    ? isPublicIpv4(address)
    : family === 6 && isPublicIpv6(address);
}

async function resolvePublicAddresses(hostname: string): Promise<ResolvedAddress[]> {
  const family = isIP(hostname);
  const addresses = family ? [{ address: hostname, family }] : await new Promise<ResolvedAddress[]>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("DNS lookup timed out")), DNS_TIMEOUT_MS);
    lookup(hostname, { all: true, verbatim: true }).then(
      (resolvedAddresses) => {
        clearTimeout(timeout);
        resolve(resolvedAddresses);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });

  if (addresses.length === 0 || addresses.some(({ address, family: addressFamily }) => !isPublicAddress(address, addressFamily))) {
    throw new Error("The requested host is not publicly routable");
  }

  return addresses;
}

function fetchHtml(url: URL, addresses: ResolvedAddress[]): Promise<{
  status: number;
  contentType: string;
  html: string;
}> {
  return new Promise((resolve, reject) => {
    const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
      if (options.all) {
        callback(null, addresses);
        return;
      }

      const address = addresses[0];
      callback(null, address.address, address.family);
    };
    const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = transport(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Tech-Utility-Link-Preview/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      lookup: pinnedLookup,
      maxHeaderSize: 16 * 1024,
    });
    const timeout = setTimeout(() => req.destroy(new Error("Request timed out")), REQUEST_TIMEOUT_MS);

    req.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    req.on("response", (response) => {
      const contentType = response.headers["content-type"] ?? "";
      const declaredLength = Number(response.headers["content-length"] ?? 0);
      if (declaredLength > MAX_RESPONSE_BYTES) {
        req.destroy(new Error("Response too large"));
        return;
      }

      const chunks: Buffer[] = [];
      let responseBytes = 0;
      response.on("data", (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        responseBytes += buffer.length;
        if (responseBytes > MAX_RESPONSE_BYTES) {
          req.destroy(new Error("Response too large"));
          return;
        }
        chunks.push(buffer);
      });
      response.on("end", () => {
        clearTimeout(timeout);
        resolve({
          status: response.statusCode ?? 0,
          contentType,
          html: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });

    req.end();
  });
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

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_PREVIEW_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Link preview request exceeds the 4 KB limit" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid or oversized request body" }, { status: 400 });
  }

  const parsed = linkPreviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid URL is required" }, { status: 400 });
  }
  const rawUrl = parsed.data.url;

  let url: URL;
  try {
    url = new URL(rawUrl);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      (url.port && url.port !== (url.protocol === "http:" ? "80" : "443"))
    ) {
      throw new Error("bad URL");
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = await resolvePublicAddresses(hostname);
    const response = await fetchHtml(url, addresses);

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json({ url: rawUrl, error: "Could not fetch page" }, { status: 200 });
    }

    if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(response.contentType)) {
      return NextResponse.json({ url: rawUrl, error: "Page is not HTML" }, { status: 200 });
    }

    const preview: LinkPreviewData = {
      url: rawUrl,
      title: extractMeta(response.html, "title") ?? extractTitle(response.html),
      description: extractMeta(response.html, "description"),
      image: extractMeta(response.html, "image"),
      favicon: `${url.origin}/favicon.ico`,
    };

    return NextResponse.json(preview);
  } catch (err) {
    const msg = err instanceof Error && err.message === "Request timed out"
      ? "Request timed out"
      : "Could not fetch preview";
    return NextResponse.json({ url: rawUrl, error: msg }, { status: 200 });
  }
}
