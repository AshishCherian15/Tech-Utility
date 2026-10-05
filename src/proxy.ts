import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  // Allow auth callback without session check
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
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

  const protectedPaths = ["/dashboard", "/entries", "/categories", "/favorites", "/trash", "/settings", "/users"];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isApi = pathname.startsWith("/api/");
  const isAccountDeletion = pathname === "/api/account" && request.method === "DELETE";
  const ownerEmail = process.env.ASH_OWNER_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(user?.email && ownerEmail && user.email.toLowerCase() === ownerEmail);
  const accountType = user?.app_metadata?.account_type;
  const accountRole = user?.app_metadata?.role;
  const hasProvisionedRole =
    (accountType === "permanent" && accountRole === "permanent_user") ||
    (accountType === "temporary" && accountRole === "guest_access") ||
    (accountType === "permanent" && accountRole === "owner");
  const isProvisioned = Boolean(hasProvisionedRole && typeof user?.app_metadata?.enabled === "boolean");
  const hasAppAccess = Boolean(user && (isOwner || isProvisioned));

  if (user && !hasAppAccess && (pathname === "/" || isProtected || isApi) && !isAccountDeletion) {
    if (isApi) {
      return NextResponse.json({ error: "This account has not been provisioned for Tech-Utility" }, { status: 403 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "not_provisioned");
    return NextResponse.redirect(url);
  }

  const expiresAt = user?.app_metadata?.expires_at;
  const expiryTime = typeof expiresAt === "string" ? Date.parse(expiresAt) : null;
  const isTemporaryAccount = user?.app_metadata?.account_type === "temporary";
  const accessExpired = isTemporaryAccount
    ? expiryTime === null || !Number.isFinite(expiryTime) || expiryTime <= Date.now()
    : expiryTime !== null && (!Number.isFinite(expiryTime) || expiryTime <= Date.now());
  const accessDisabled = user?.app_metadata?.enabled === false;
  const accountAccessInactive = Boolean(user && !isOwner && (accessDisabled || accessExpired));

  if (accountAccessInactive && !isAccountDeletion) {
    if (isApi) {
      return NextResponse.json({ error: "This account is disabled or has expired" }, { status: 403 });
    }
    if (pathname === "/login") return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "account_inactive");
    return NextResponse.redirect(url);
  }

  // If user is not authenticated and trying to access root / or protected paths, send to /login
  if (!user && (pathname === "/" || isProtected)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // If user IS authenticated and on /login or root /, redirect to /dashboard
  if (user && hasAppAccess && !accountAccessInactive && (pathname === "/login" || pathname === "/")) {
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
