import { z } from "zod";
import { readJsonBody } from "@/lib/validation/json";

const entryFields = {
  title: z.string().trim().min(1).max(500),
  category_id: z.string().uuid().nullable(),
  type: z.enum(["Tip", "Trick", "Hack", "App", "Website", "Tool", "Extension", "Command", "Guide", "Prompt"]),
  tags: z.array(z.string().max(100)).max(100),
  what_it_is: z.string().max(10000).nullable(),
  why_useful: z.string().max(10000).nullable(),
  who_can_use: z.string().max(10000).nullable(),
  when_to_use: z.string().max(10000).nullable(),
  how_to_use: z.string().max(10000).nullable(),
  example: z.string().max(10000).nullable(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).nullable(),
  platform: z.enum(["Windows", "Android", "iOS", "macOS", "Linux", "Web", "Cross-platform"]).nullable(),
  command_snippet: z.string().max(10000).nullable(),
  images: z.array(z.string().max(2048)).max(20),
  color: z.string().max(32).nullable(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED", "FLAGGED"]).nullable(),
  hero_tag: z.string().max(100).nullable(),
  cover_image_url: z.string().url().max(2048).nullable(),
};

export const createEntrySchema = z.object({
  ...entryFields,
  title: entryFields.title,
  category_id: entryFields.category_id.optional().default(null),
  type: entryFields.type.optional().default("Tip"),
  tags: entryFields.tags.optional().default([]),
  what_it_is: entryFields.what_it_is.optional().default(null),
  why_useful: entryFields.why_useful.optional().default(null),
  who_can_use: entryFields.who_can_use.optional().default(null),
  when_to_use: entryFields.when_to_use.optional().default(null),
  how_to_use: entryFields.how_to_use.optional().default(null),
  example: entryFields.example.optional().default(null),
  difficulty: entryFields.difficulty.optional().default(null),
  platform: entryFields.platform.optional().default(null),
  command_snippet: entryFields.command_snippet.optional().default(null),
  images: entryFields.images.optional().default([]),
  color: entryFields.color.optional().default(null),
  status: entryFields.status.optional().default("DRAFT"),
  hero_tag: entryFields.hero_tag.optional().default(null),
  cover_image_url: entryFields.cover_image_url.optional().default(null),
}).strict();

export const updateEntrySchema = z.object({
  ...entryFields,
  pinned: z.boolean(),
  favorited: z.boolean(),
  deleted_at: z.string().datetime({ offset: true }).nullable(),
}).partial().strict().refine((value) => Object.keys(value).length > 0, {
  message: "At least one editable field is required",
});

export const MAX_ENTRY_REQUEST_BYTES = 256 * 1024;

export function readEntryJson(request: Request): Promise<unknown> {
  return readJsonBody(request, MAX_ENTRY_REQUEST_BYTES);
}
