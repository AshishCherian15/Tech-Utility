export type EntryType =
  | "Tip"
  | "Trick"
  | "Hack"
  | "App"
  | "Website"
  | "Tool"
  | "Extension"
  | "Command"
  | "Guide"
  | "Prompt";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type Platform =
  | "Windows"
  | "Android"
  | "iOS"
  | "macOS"
  | "Linux"
  | "Web"
  | "Cross-platform";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
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
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ViewMode = "grid" | "list" | "table" | "gallery";

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
  links?: Array<{ platform: string; url: string; label?: string }>;
  ai_drafted?: boolean;
}
