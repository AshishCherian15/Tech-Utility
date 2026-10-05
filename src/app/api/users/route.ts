import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/validation/json";
import { z } from "zod";

const MAX_UPDATE_REQUEST_BYTES = 1024;
const MAX_USERS = 1000;
const updateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_enabled"),
    userId: z.string().uuid(),
    enabled: z.boolean(),
  }),
  z.object({
    action: z.literal("renew"),
    userId: z.string().uuid(),
    duration: z.enum(["1h", "6h", "24h", "7d", "30d"]),
  }),
  z.object({
    action: z.literal("update"),
    userId: z.string().uuid(),
    username: z.string().trim().min(1).max(64).optional(),
    email: z.string().email().max(320).optional(),
    password: z.string().min(12).max(128).regex(/^(?=.*\d)(?=.*[^A-Za-z0-9]).+$/).optional(),
    can_create_entries: z.boolean().optional(),
    can_edit_delete_entries: z.boolean().optional(),
  }),
]);

function getExpiresAt(duration: string): string {
  const amount = Number.parseInt(duration.slice(0, -1), 10);
  const unit = duration.at(-1);
  const seconds = amount * (unit === "h" ? 3600 : unit === "d" ? 86400 : 1);
  return new Date(Date.now() + seconds * 1000).toISOString();
}

async function isConfiguredOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const ownerEmail = process.env.ASH_OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || user.email?.toLowerCase() !== ownerEmail) {
    return { response: NextResponse.json({ error: "Only the configured owner can manage accounts" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await isConfiguredOwner();
  if ("response" in auth) return auth.response;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: MAX_USERS });
    if (error) {
      console.error("Supabase admin user listing failed:", error.message);
      return NextResponse.json({ error: "Could not load invited accounts" }, { status: 500 });
    }

    const users = data.users.flatMap((account) => {
      const type = account.app_metadata?.account_type;
      const role = account.app_metadata?.role;
      if (
        !((type === "permanent" && role === "permanent_user") ||
          (type === "temporary" && role === "guest_access"))
      ) {
        return [];
      }

      return [{
        id: account.id,
        email: account.email ?? "",
        username: typeof account.user_metadata?.username === "string"
          ? account.user_metadata.username.slice(0, 64)
          : account.email?.split("@")[0] ?? "Invited user",
        accountType: type,
        enabled: account.app_metadata.enabled === true,
        expiresAt: typeof account.app_metadata.expires_at === "string"
          ? account.app_metadata.expires_at
          : null,
        expired: type === "temporary" &&
          (typeof account.app_metadata.expires_at !== "string" ||
            !Number.isFinite(Date.parse(account.app_metadata.expires_at)) ||
            Date.parse(account.app_metadata.expires_at) <= Date.now()),
        canCreateEntries: account.app_metadata.can_create_entries === true,
        canEditDeleteEntries: account.app_metadata.can_edit_delete_entries === true,
      }];
    });

    return NextResponse.json(
      { users, truncated: data.users.length === MAX_USERS },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Account listing configuration error:", error);
    return NextResponse.json({ error: "Account management is not configured" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await isConfiguredOwner();
  if ("response" in auth) return auth.response;

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_UPDATE_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Account update exceeds the 1 KB limit" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid or oversized request body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid account update" }, { status: 400 });
  }
  if (parsed.data.userId === auth.user.id) {
    return NextResponse.json({ error: "The owner account cannot be changed here" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: existing, error: lookupError } = await admin.auth.admin.getUserById(parsed.data.userId);
    if (lookupError) {
      console.error("Supabase admin account lookup failed:", lookupError.message);
      return NextResponse.json({ error: "Could not load the invited account" }, { status: 500 });
    }

    const account = existing.user;
    const type = account.app_metadata?.account_type;
    const role = account.app_metadata?.role;
    const isProvisioned =
      (type === "permanent" && role === "permanent_user") ||
      (type === "temporary" && role === "guest_access");
    if (!isProvisioned) {
      return NextResponse.json({ error: "Only invited accounts can be changed here" }, { status: 404 });
    }
    const expiry = account.app_metadata?.expires_at;
    const isExpiredTemporary = type === "temporary" &&
      (typeof expiry !== "string" ||
        !Number.isFinite(Date.parse(expiry)) ||
        Date.parse(expiry) <= Date.now());
    if (parsed.data.action === "set_enabled" && parsed.data.enabled && isExpiredTemporary) {
      return NextResponse.json({
        error: "This temporary account has expired. Renew its access instead.",
      }, { status: 409 });
    }
    if (parsed.data.action === "renew" && type !== "temporary") {
      return NextResponse.json({ error: "Only temporary accounts can be renewed" }, { status: 400 });
    }
    if (parsed.data.action === "renew" && !isExpiredTemporary) {
      return NextResponse.json({ error: "Only expired temporary accounts can be renewed" }, { status: 409 });
    }

    if (parsed.data.action === "update") {
      const updateData: { user_metadata?: { username?: string }; password?: string; app_metadata?: { can_create_entries?: boolean; can_edit_delete_entries?: boolean } } = {};
      if (parsed.data.username) {
        updateData.user_metadata = { username: parsed.data.username };
      }
      if (parsed.data.password) {
        updateData.password = parsed.data.password;
      }
      if (parsed.data.can_create_entries !== undefined || parsed.data.can_edit_delete_entries !== undefined) {
        updateData.app_metadata = {
          ...(parsed.data.can_create_entries !== undefined ? { can_create_entries: parsed.data.can_create_entries } : {}),
          ...(parsed.data.can_edit_delete_entries !== undefined ? { can_edit_delete_entries: parsed.data.can_edit_delete_entries } : {}),
        };
      }

      const { data, error } = await admin.auth.admin.updateUserById(account.id, updateData);
      if (error) {
        console.error("Supabase admin account update failed:", error.message);
        return NextResponse.json({ error: "Could not update account" }, { status: 500 });
      }

      return NextResponse.json(
        {
          user: {
            id: data.user.id,
            username: typeof data.user.user_metadata?.username === "string"
              ? data.user.user_metadata.username
              : data.user.email?.split("@")[0] ?? "Invited user",
            email: data.user.email ?? "",
            canCreateEntries: data.user.app_metadata?.can_create_entries === true,
            canEditDeleteEntries: data.user.app_metadata?.can_edit_delete_entries === true,
          },
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const appMetadata = parsed.data.action === "renew"
      ? { ...account.app_metadata, enabled: true, expires_at: getExpiresAt(parsed.data.duration) }
      : { ...account.app_metadata, enabled: parsed.data.enabled };
    const { data, error } = await admin.auth.admin.updateUserById(account.id, {
      app_metadata: appMetadata,
    });
    if (error) {
      console.error("Supabase admin account update failed:", error.message);
      return NextResponse.json({ error: "Could not update invited account access" }, { status: 500 });
    }

    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          enabled: data.user.app_metadata?.enabled === true,
          expiresAt: typeof data.user.app_metadata?.expires_at === "string"
            ? data.user.app_metadata.expires_at
            : null,
          expired: type === "temporary" &&
            (typeof data.user.app_metadata?.expires_at !== "string" ||
              !Number.isFinite(Date.parse(data.user.app_metadata.expires_at)) ||
              Date.parse(data.user.app_metadata.expires_at) <= Date.now()),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Account update configuration error:", error);
    return NextResponse.json({ error: "Account management is not configured" }, { status: 500 });
  }
}
