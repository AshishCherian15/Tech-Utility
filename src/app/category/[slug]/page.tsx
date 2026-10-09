import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EntryCard from "@/components/EntryCard";
import { createClient } from "@/lib/supabase/server";
import type { Category, Entry } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface PublicCategoryPageProps {
  params: Promise<{ slug: string }>;
}

type CategoryWithOptionalSlug = Category & { slug?: string | null };

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;

  const category = (categories as CategoryWithOptionalSlug[] | null)?.find((item) => {
    const stableSlug = item.slug || slugify(item.name);
    return stableSlug === slug;
  });

  return { supabase, category };
}

export async function generateMetadata({ params }: PublicCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getCategory(slug);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.name} entries`,
    description: category.description ?? `Browse published ByteShelf entries in ${category.name}.`,
  };
}

export default async function PublicCategoryPage({ params }: PublicCategoryPageProps) {
  const { slug } = await params;
  const { supabase, category } = await getCategory(slug);

  if (!category) notFound();

  const { data: entries, error } = await supabase
    .from("entries")
    .select("*, category:categories(*), links:entry_links(*)")
    .eq("status", "PUBLISHED")
    .eq("category_id", category.id)
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <main className="public-category-page">
      <header className="public-category-header">
        <Link href="/" className="public-category-back">ByteShelf</Link>
        <div className="public-category-title-row">
          <span className="public-category-icon" style={{ color: category.color }}>{category.icon}</span>
          <div>
            <h1>{category.name}</h1>
            <p>{category.description ?? "Published tech tips, tools, commands, and guides from the ByteShelf library."}</p>
          </div>
        </div>
      </header>

      {entries && entries.length > 0 ? (
        <section className="public-category-grid" aria-label={`${category.name} entries`}>
          {(entries as Entry[]).map((entry) => (
            <EntryCard key={entry.id} entry={entry} typeColorClass="badge-blue" hrefPrefix="/entry" />
          ))}
        </section>
      ) : (
        <section className="public-category-empty">
          <h2>No published entries yet</h2>
          <p>This category exists, but nothing in it is public right now.</p>
        </section>
      )}

      <style>{`
        .public-category-page {
          min-height: 100vh;
          background: var(--bg-base);
        }

        .public-category-header {
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 32px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-surface);
        }

        .public-category-back {
          width: fit-content;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .public-category-back:hover {
          color: var(--text-primary);
        }

        .public-category-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 860px;
        }

        .public-category-icon {
          display: grid;
          width: 56px;
          height: 56px;
          place-items: center;
          flex: 0 0 56px;
          border-radius: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          font-size: 28px;
        }

        .public-category-title-row h1 {
          margin: 0;
          color: var(--text-primary);
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .public-category-title-row p {
          margin-top: 6px;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .public-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
          padding: 32px;
        }

        .public-category-empty {
          padding: 80px 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .public-category-empty h2 {
          color: var(--text-primary);
          font-size: 22px;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .public-category-header,
          .public-category-grid {
            padding: 20px 16px;
          }

          .public-category-title-row {
            align-items: flex-start;
          }

          .public-category-title-row h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}
