import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("entry_types")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      // If table doesn't exist, return empty array with fallback types
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json([
          { id: 'default-1', name: 'command', description: 'Terminal commands and CLI tools', icon: 'terminal', color: 'blue', is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-2', name: 'app', description: 'Desktop applications and GUI tools', icon: 'monitor', color: 'green', is_active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-3', name: 'website', description: 'Web applications and online services', icon: 'globe', color: 'cyan', is_active: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-4', name: 'extension', description: 'Browser extensions and plugins', icon: 'puzzle', color: 'purple', is_active: true, sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-5', name: 'library', description: 'Code libraries and frameworks', icon: 'code', color: 'blue', is_active: true, sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-6', name: 'workflow', description: 'Automations and processes', icon: 'workflow', color: 'cyan', is_active: true, sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-7', name: 'guide', description: 'Tutorials and documentation', icon: 'book', color: 'blue', is_active: true, sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-8', name: 'tool', description: 'Utilities and helper tools', icon: 'wrench', color: 'gray', is_active: true, sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
