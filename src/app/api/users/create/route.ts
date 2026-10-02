import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, username, account_type = "temporary", duration = "none", enabled = true } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Call Supabase admin API or create user via auth.signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
          invited_by: user.id,
          role: account_type === "permanent" ? "permanent_user" : "guest_access",
          account_type,
          duration,
          enabled,
          expires_at: duration !== "none" ? getExpiresAt(duration) : null,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Account created for ${email}`,
      userId: data.user?.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getExpiresAt(durationStr: string): string | null {
  const now = new Date();
  if (durationStr.endsWith("h")) {
    const hours = parseInt(durationStr.replace("h", ""), 10);
    now.setHours(now.getHours() + hours);
  } else if (durationStr.endsWith("d")) {
    const days = parseInt(durationStr.replace("d", ""), 10);
    now.setDate(now.getDate() + days);
  } else if (durationStr.endsWith("s")) {
    const secs = parseInt(durationStr.replace("s", ""), 10);
    now.setSeconds(now.getSeconds() + secs);
  }
  return now.toISOString();
}
