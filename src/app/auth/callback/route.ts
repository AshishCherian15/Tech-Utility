import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/dashboard";
  let nextUrl: URL;
  try {
    nextUrl = new URL(requestedNext, origin);
    if (nextUrl.origin !== origin) throw new Error("External redirect");
  } catch {
    nextUrl = new URL("/dashboard", origin);
  }
  const error_desc = searchParams.get("error_description");

  console.log('OAuth callback:', {
    hasCode: !!code,
    errorDesc,
    requestedNext,
    origin,
  });

  if (error_desc) {
    console.error('OAuth error description:', error_desc);
    if (requestedNext === "/auth/reset-password") {
      return NextResponse.redirect(`${origin}/login?error=recovery`);
    }
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('Session exchanged successfully, redirecting to:', nextUrl.href);
      return NextResponse.redirect(nextUrl);
    } else {
      console.error('Session exchange failed:', error);
      if (requestedNext === "/auth/reset-password") {
        return NextResponse.redirect(`${origin}/login?error=recovery`);
      }
      return NextResponse.redirect(`${origin}/login?error=oauth`);
    }
  }

  console.log('No code in callback, redirecting to dashboard');
  if (requestedNext === "/auth/reset-password") {
    return NextResponse.redirect(`${origin}/login?error=recovery`);
  }
  return NextResponse.redirect(`${origin}/dashboard`);
}
