import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardUrl = request.headers.get("x-forwarded-host")
        ? `https://${request.headers.get("x-forwarded-host")}${next}`
        : `${origin}${next}`;
      return NextResponse.redirect(forwardUrl);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
