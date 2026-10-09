import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that are fully public — no auth required
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/privacy",
  "/terms",
  "/cookies",
  "/auth/callback",
  "/auth/reset-password",
];

// Route prefixes that are fully public
const PUBLIC_PREFIXES = [
  "/entry/",      // public entry detail pages
  "/category/",   // public category pages
];

// Routes that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/entries",
  "/categories",
  "/favorites",
  "/trash",
  "/settings",
  "/users",
  "/review-queue",
];

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // CSRF guard for all mutating API calls
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
  if (pathname.startsWith("/api/") && isMutation) {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    let originIsValid = true;
    if (origin) {
      try {
        originIsValid = new URL(origin).origin === request.nextUrl.origin;
      } catch {
        originIsValid = false;
      }
    }
    if (!originIsValid || fetchSite === "cross-site") {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if this path is fully public (no auth needed)
  const isPublicPath =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/public/");

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isApi = pathname.startsWith("/api/");
  const isAccountDeletion = pathname === "/api/account" && request.method === "DELETE";

  // ByteShelf role resolution
  const ownerEmail = process.env.BYTESHELF_OWNER_EMAIL?.trim().toLowerCase()
    // fallback to old env var name during migration
    ?? process.env.BYTESHELF_ADMIN_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(
    user?.email && ownerEmail && user.email.toLowerCase() === ownerEmail
  );

  // A user has app access if they are:
  // 1. The owner (admin)
  // 2. A contributor/moderator/admin with an active account
  // 3. Any authenticated user (public signup — contributors are auto-provisioned)
  const appMetaRole = user?.app_metadata?.role as string | undefined;
  const isDisabled = user?.app_metadata?.enabled === false;
  const expiresAt = user?.app_metadata?.expires_at;
  const expiryTime = typeof expiresAt === "string" ? Date.parse(expiresAt) : null;
  const isExpired =
    expiryTime !== null && Number.isFinite(expiryTime) && expiryTime <= Date.now();

  // Legacy invited-account check (permanent/temporary from old system)
  const isLegacyProvisioned =
    (user?.app_metadata?.account_type === "permanent" &&
      (appMetaRole === "permanent_user" || appMetaRole === "owner")) ||
    (user?.app_metadata?.account_type === "temporary" &&
      appMetaRole === "guest_access");

  // ByteShelf public contributor — any authenticated user who isn't disabled/expired
  const isByteShelfUser =
    Boolean(user) &&
    !isDisabled &&
    !isExpired;

  const hasAppAccess = isOwner || isByteShelfUser || isLegacyProvisioned;

  // Disabled/expired account check
  const accountAccessInactive = Boolean(
    user && !isOwner && (isDisabled || isExpired)
  );

  if (accountAccessInactive && !isAccountDeletion) {
    if (isApi) {
      return NextResponse.json(
        { error: "This account is disabled or has expired" },
        { status: 403 }
      );
    }
    if (pathname === "/login") return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "account_inactive");
    return NextResponse.redirect(url);
  }

  // Unauthenticated user trying to access protected route
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // Unauthenticated user hitting a protected API
  if (!user && isApi && !isPublicPath && !isAccountDeletion) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authenticated user on /login → redirect to dashboard
  if (user && hasAppAccess && !accountAccessInactive && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.*\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
