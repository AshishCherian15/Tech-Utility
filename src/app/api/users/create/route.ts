import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/validation/json";
import { z } from "zod";

const MAX_ACCOUNT_REQUEST_BYTES = 8 * 1024;
const accountSchema = z.object({
  email: z.string().email().max(320),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128)
    .regex(/^(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "Password must include a number and a symbol"),
  username: z.string().trim().min(1).max(64),
  account_type: z.enum(["permanent", "temporary"]),
  duration: z.string().regex(/^(none|[1-9]\d{0,6}[hds])$/),
  enabled: z.boolean(),
}).refine(
  (account) => account.account_type === "permanent" || account.duration !== "none",
  { message: "Temporary accounts must have an expiration", path: ["duration"] },
);

function getExpiresAt(duration: string): string | null {
  const amount = Number.parseInt(duration.slice(0, -1), 10);
  const unit = duration.at(-1);
  const seconds = amount * (unit === "h" ? 3600 : unit === "d" ? 86400 : 1);

  if (!Number.isSafeInteger(seconds) || seconds < 1 || seconds > 30 * 86400) {
    throw new Error("Duration must be between one second and 30 days");
  }

  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ownerEmail = process.env.ASH_OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || user.email?.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: "Only the configured owner can create accounts" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_ACCOUNT_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Account request exceeds the 8 KB limit" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid or oversized request body" }, { status: 400 });
  }

  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid account details", details: parsed.error.issues }, { status: 400 });
  }

  const account = parsed.data;
  let expiresAt: string | null;
  try {
    expiresAt = account.account_type === "temporary" ? getExpiresAt(account.duration) : null;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid duration" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { username: account.username, invited_by: user.id },
      app_metadata: {
        role: account.account_type === "permanent" ? "permanent_user" : "guest_access",
        account_type: account.account_type,
        enabled: account.enabled,
        expires_at: expiresAt,
      },
    });

    if (error) {
      console.error("Supabase admin user creation failed:", error.message);
      return NextResponse.json({ error: "Could not create the account" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Account created for ${account.email}`,
      userId: data.user.id,
    });
  } catch (error) {
    console.error("Account creation configuration error:", error);
    return NextResponse.json({ error: "Account creation is not configured" }, { status: 500 });
  }
}
