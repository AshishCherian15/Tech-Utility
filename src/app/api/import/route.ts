import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const entrySchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(["Tip","Trick","Hack","App","Website","Tool","Extension","Command","Guide","Prompt"]).default("Tip"),
  tags: z.array(z.string()).default([]),
  what_it_is: z.string().nullish(),
  why_useful: z.string().nullish(),
  who_can_use: z.string().nullish(),
  when_to_use: z.string().nullish(),
  how_to_use: z.string().nullish(),
  example: z.string().nullish(),
  difficulty: z.enum(["Easy","Medium","Hard"]).nullish(),
  platform: z.enum(["Windows","Android","iOS","macOS","Linux","Web","Cross-platform"]).nullish(),
  command_snippet: z.string().nullish(),
  images: z.array(z.string()).default([]),
  color: z.string().nullish(),
  pinned: z.boolean().default(false),
  favorited: z.boolean().default(false),
});

const importSchema = z.object({
  version: z.number().optional(),
  entries: z.array(z.unknown()),
  categories: z.array(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import format", details: parsed.error.issues }, { status: 400 });
  }

  const { entries: rawEntries } = parsed.data;

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (const raw of rawEntries) {
    const ep = entrySchema.safeParse(raw);
    if (!ep.success) {
      results.skipped++;
      results.errors.push(`Skipped entry: ${(raw as Record<string,unknown>)?.title ?? "unknown"}`);
      continue;
    }

    const { error } = await supabase.from("entries").insert({
      ...ep.data,
      user_id: user.id,
      deleted_at: null,
    });

    if (error) {
      results.skipped++;
      results.errors.push(`Error on "${ep.data.title}": ${error.message}`);
    } else {
      results.imported++;
    }
  }

  return NextResponse.json(results, { status: 200 });
}
