import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/validation/json";
import { z } from "zod";

const entrySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(500),
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
  category_id: z.string().uuid().nullable().optional(),
  type: z.enum(["Tip", "Trick", "Hack", "App", "Website", "Tool", "Extension", "Command", "Guide", "Prompt"]).default("Tip"),
  tags: z.array(z.string().max(100)).max(100).default([]),
  what_it_is: z.string().max(10000).nullish(),
  why_useful: z.string().max(10000).nullish(),
  who_can_use: z.string().max(10000).nullish(),
  when_to_use: z.string().max(10000).nullish(),
  how_to_use: z.string().max(10000).nullish(),
  example: z.string().max(10000).nullish(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).nullish(),
  platform: z.enum(["Windows", "Android", "iOS", "macOS", "Linux", "Web", "Cross-platform"]).nullish(),
  command_snippet: z.string().max(10000).nullish(),
  images: z.array(z.string().max(2048)).max(20).default([]),
  color: z.string().max(32).nullish(),
  pinned: z.boolean().default(false),
  favorited: z.boolean().default(false),
  deleted_at: z.string().datetime({ offset: true }).nullish(),
});

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(100),
  description: z.string().max(1000).nullish(),
  icon: z.string().max(32).default("📂"),
  color: z.string().max(32).default("#3b82f6"),
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
});

const linkSchema = z.object({
  entry_id: z.string().uuid(),
  platform: z.string().trim().min(1).max(100),
  url: z.string().url().max(2048).refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
  label: z.string().max(200).nullish(),
  verified: z.boolean().default(false),
  created_at: z.string().datetime({ offset: true }).optional(),
});

const importSchema = z.object({
  version: z.number().optional(),
  entries: z.array(z.unknown()).max(5000),
  categories: z.array(z.unknown()).max(200).optional(),
  entry_links: z.array(z.unknown()).max(5000).optional(),
});

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const ENTRY_INSERT_BATCH_SIZE = 100;
const LINK_INSERT_BATCH_SIZE = 500;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: "Import file exceeds the 10 MB limit" }, { status: 413 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_IMPORT_BYTES);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Import file exceeds the 10 MB limit" }, { status: 413 });
    }
    return NextResponse.json(
      { error: "Invalid import body" },
      { status: 400 }
    );
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import format", details: parsed.error.issues }, { status: 400 });
  }

  const results = {
    imported: 0,
    skipped: 0,
    linksImported: 0,
    linksSkipped: 0,
    errors: [] as string[],
  };
  const categoryIds = new Map<string, string>();
  const failedCategoryIds = new Set<string>();

  for (const rawCategory of parsed.data.categories ?? []) {
    const categoryResult = categorySchema.safeParse(rawCategory);
    if (!categoryResult.success) {
      results.skipped++;
      results.errors.push("Skipped an invalid category");
      continue;
    }

    const category = categoryResult.data;
    const sourceCategoryId = category.id;
    let targetId: string | null = null;
    if (category.id) {
      const { data, error } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Import category lookup failed:", error.message);
        failedCategoryIds.add(category.id);
        results.skipped++;
        results.errors.push(`Could not look up category "${category.name}"`);
        continue;
      }
      targetId = data?.id ?? null;
    }

    if (!targetId) {
      const { data: existing, error } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", category.name)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Import category lookup failed:", error.message);
        if (sourceCategoryId) failedCategoryIds.add(sourceCategoryId);
        results.skipped++;
        results.errors.push(`Could not check whether category "${category.name}" already exists`);
        continue;
      }
      targetId = existing?.id ?? null;
    }

    if (!targetId) {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: category.name,
          description: category.description ?? null,
          icon: category.icon,
          color: category.color,
          created_at: category.created_at,
          updated_at: category.updated_at,
        })
        .select("id")
        .single();
      if (error) {
        console.error("Import category creation failed:", error.message);
        if (sourceCategoryId) failedCategoryIds.add(sourceCategoryId);
        results.skipped++;
        results.errors.push(`Could not import category "${category.name}"`);
        continue;
      }
      targetId = data.id;
    }

    if (category.id && targetId) {
      categoryIds.set(category.id, targetId);
      failedCategoryIds.delete(category.id);
    }
  }

  const importedEntryIds = new Map<string, string>();
  const importedLinks: Array<{
    entry_id: string;
    user_id: string;
    platform: string;
    url: string;
    label: string | null;
    verified: boolean;
    created_at?: string;
  }> = [];
  const validatedLinks = (parsed.data.entry_links ?? [])
    .map((rawLink) => linkSchema.safeParse(rawLink))
    .filter((result) => result.success)
    .map((result) => result.data);
  results.linksSkipped += (parsed.data.entry_links?.length ?? 0) - validatedLinks.length;

  const pendingEntries: Array<{
    sourceId?: string;
    id: string;
    title: string;
    row: Record<string, unknown>;
  }> = [];
  for (const rawEntry of parsed.data.entries) {
    const entryResult = entrySchema.safeParse(rawEntry);
    if (!entryResult.success) {
      results.skipped++;
      results.errors.push("Skipped an invalid entry");
      continue;
    }

    const entry = entryResult.data;
    const { id: sourceEntryId, ...entryValues } = entry;
    const entryImages = entry.images.filter((image) =>
      !image.startsWith("storage://entry-images/") ||
      image.startsWith(`storage://entry-images/${user.id}/`)
    );
    let categoryId = entry.category_id ? categoryIds.get(entry.category_id) ?? null : null;
    if (entry.category_id && !categoryId) {
      if (failedCategoryIds.has(entry.category_id)) {
        results.skipped++;
        results.errors.push(`Skipped "${entry.title}" because its category could not be imported`);
        continue;
      }

      const { data, error: categoryLookupError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", entry.category_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (categoryLookupError) {
        console.error("Import entry category lookup failed:", categoryLookupError.message);
        results.skipped++;
        results.errors.push(`Could not look up the category for "${entry.title}"`);
        continue;
      }
      categoryId = data?.id ?? null;
    }

    const importedEntryId = crypto.randomUUID();
    pendingEntries.push({
      sourceId: sourceEntryId,
      id: importedEntryId,
      title: entry.title,
      row: {
        ...entryValues,
        id: importedEntryId,
        user_id: user.id,
        category_id: categoryId,
        images: entryImages,
        deleted_at: entry.deleted_at ?? null,
      },
    });
  }

  for (let offset = 0; offset < pendingEntries.length; offset += ENTRY_INSERT_BATCH_SIZE) {
    const batch = pendingEntries.slice(offset, offset + ENTRY_INSERT_BATCH_SIZE);
    const { error } = await supabase.from("entries").insert(batch.map((entry) => entry.row));

    if (error) {
      console.error("Import entry batch failed:", error.message);
      results.skipped += batch.length;
      results.errors.push(`Could not import a batch of ${batch.length} entries`);
      continue;
    }

    results.imported += batch.length;
    for (const entry of batch) {
      if (entry.sourceId) importedEntryIds.set(entry.sourceId, entry.id);
      for (const link of validatedLinks) {
        if (link.entry_id === entry.sourceId) {
          importedLinks.push({
            entry_id: entry.id,
            user_id: user.id,
            platform: link.platform,
            url: link.url,
            label: link.label ?? null,
            verified: link.verified,
            created_at: link.created_at,
          });
        }
      }
    }
  }

  for (const link of validatedLinks) {
    if (!importedEntryIds.has(link.entry_id)) results.linksSkipped++;
  }

  for (let offset = 0; offset < importedLinks.length; offset += LINK_INSERT_BATCH_SIZE) {
    const batch = importedLinks.slice(offset, offset + LINK_INSERT_BATCH_SIZE);
    const { error } = await supabase.from("entry_links").insert(batch);
    if (error) {
      console.error("Import entry links failed:", error.message);
      results.linksSkipped += batch.length;
      results.errors.push(`Could not import a batch of ${batch.length} entry links`);
    } else {
      results.linksImported += batch.length;
    }
  }

  return NextResponse.json(results, { status: 200 });
}
