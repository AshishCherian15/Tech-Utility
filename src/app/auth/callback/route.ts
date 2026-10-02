import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error_desc = searchParams.get("error_description");

  if (error_desc) {
    console.error("Supabase Auth OAuth Error:", error_desc);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_desc)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardUrl = request.headers.get("x-forwarded-host")
        ? `https://${request.headers.get("x-forwarded-host")}${next}`
        : `${origin}${next}`;
      return NextResponse.redirect(forwardUrl);
    } else {
      console.error("Exchange Code Session Error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
