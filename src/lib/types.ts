// Entry type is now database-driven (from entry_types table)
// The old enum values are preserved as seeded data
export type EntryType = string;

export interface EntryTypeConfig {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type Platform =
  | "Windows"
  | "Android"
  | "iOS"
  | "macOS"
  | "Linux"
  | "Web"
  | "Cross-platform";

// ByteShelf user roles (stored in app_metadata.role)
export type UserRole =
  | "visitor"          // unauthenticated — not stored as a row
  | "contributor"      // registered, can submit entries (go to review queue)
  | "trusted_contributor" // earned tier — submissions auto-publish
  | "moderator"        // can approve/reject/unpublish entries
  | "admin";           // full access including role management

// Entry lifecycle status
export type EntryStatus =
  | "DRAFT"      // being written, not submitted
  | "PENDING"    // submitted, awaiting moderator review
  | "PUBLISHED"  // live, publicly visible and indexable
  | "REJECTED"   // reviewed and declined (visible only to author + reason)
  | "FLAGGED";   // was published, reported by users, pulled pending re-review

export type PricingTier = "free" | "freemium" | "paid";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  entry_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface EntryLink {
  id: string;
  entry_id: string;
  user_id: string;
  platform: string;
  url: string;
  label: string | null;
  verified: boolean;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  slug: string | null;
  category_id: string | null;
  category?: Category;
  type: EntryType;
  tags: string[];
  what_it_is: string | null;
  why_useful: string | null;
  who_can_use: string | null;
  when_to_use: string | null;
  how_to_use: string | null;
  example: string | null;
  difficulty: DifficultyLevel | null;
  platform: Platform | null;
  command_snippet: string | null;
  images: string[];
  links: EntryLink[];
  color: string | null;
  pinned: boolean;
  favorited: boolean;
  // ByteShelf public fields
  status: EntryStatus;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  pricing: PricingTier | null;
  pricing_note: string | null;
  hero_tag: string | null;
  cover_image_url: string | null;
  // Soft delete (kept for trash bin)
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ViewMode = "grid" | "list" | "table" | "gallery" | "masonry";

export type SortOption =
  | "newest"
  | "recently_edited"
  | "favorites"
  | "most_used"
  | "alphabetical";

export interface SearchFilters {
  q?: string;
  category_id?: string;
  type?: EntryType;
  difficulty?: DifficultyLevel;
  platform?: Platform;
  favorited?: boolean;
  pinned?: boolean;
  status?: EntryStatus;
}

export interface DraftEntry {
  title?: string;
  category_id?: string;
  type?: EntryType;
  tags?: string[];
  what_it_is?: string;
  why_useful?: string;
  who_can_use?: string;
  when_to_use?: string;
  how_to_use?: string;
  example?: string;
  difficulty?: DifficultyLevel;
  platform?: Platform;
  command_snippet?: string;
  pricing?: PricingTier;
  pricing_note?: string;
  hero_tag?: string;
  links?: Array<{ platform: string; url: string; label?: string }>;
  ai_drafted?: boolean;
}

// Moderation
export interface Report {
  id: string;
  entry_id: string;
  reported_by_id: string;
  reason: string;
  created_at: string;
  resolved_at: string | null;
}

export interface ModerationAction {
  id: string;
  moderator_id: string;
  entry_id: string | null;
  action: "approved" | "rejected" | "unpublished" | "flagged" | "account_disabled" | "account_enabled";
  reason: string | null;
  created_at: string;
}
