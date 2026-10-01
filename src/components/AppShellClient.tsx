"use client";

import CommandPalette from "@/components/CommandPalette";
import type { Entry } from "@/lib/types";

interface AppShellClientProps {
  entries: Partial<Entry>[];
}

export default function AppShellClient({ entries }: AppShellClientProps) {
  return <CommandPalette entries={entries as Entry[]} />;
}
