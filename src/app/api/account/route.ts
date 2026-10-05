import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/validation/json";

const BUCKET = "entry-images";
const PAGE_SIZE = 100;
const DELETE_BATCH_SIZE = 100;
const MAX_DELETE_REQUEST_BYTES = 1024;
const deleteSchema = z.object({ email: z.string().email().max(320) });

async function listAccountFiles(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const files: string[] = [];
  const folders = [userId];

  while (folders.length > 0) {
    const folder = folders.pop();
    if (!folder) continue;

    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await admin.storage.from(BUCKET).list(folder, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw new Error(`Could not list account files: ${error.message}`);

      for (const item of data ?? []) {
        const path = `${folder}/${item.name}`;
        if (item.id === null) folders.push(path);
        else files.push(path);
      }

      if (!data || data.length < PAGE_SIZE) break;
    }
  }

  return files;
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.email) {
    return NextResponse.json({ error: "An email address is required to confirm deletion" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_DELETE_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Confirmation request exceeds the 1 KB limit" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid or oversized confirmation" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success || parsed.data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "Enter the email address for the signed-in account to confirm deletion" }, { status: 400 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("Account deletion configuration error:", error);
    return NextResponse.json({ error: "Account deletion is not configured" }, { status: 500 });
  }

  try {
    const files = await listAccountFiles(admin, user.id);
    for (let offset = 0; offset < files.length; offset += DELETE_BATCH_SIZE) {
      const { error } = await admin.storage.from(BUCKET).remove(files.slice(offset, offset + DELETE_BATCH_SIZE));
      if (error) throw new Error(`Could not remove account files: ${error.message}`);
    }
  } catch (error) {
    console.error("Account storage cleanup failed:", error);
    return NextResponse.json(
      { error: "Could not remove account files. The account was not deleted; try again or contact support." },
      { status: 500 }
    );
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Supabase account deletion failed:", error.message);
    return NextResponse.json(
      { error: "Account files were removed, but the account could not be deleted. Contact support before retrying." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
