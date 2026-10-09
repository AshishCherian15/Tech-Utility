import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import type { PublicPageContent } from "@/lib/public-page-content";
import { legalPageLinks, publicPageLinks } from "@/lib/public-page-content";

export function PublicPage({ page }: { page: PublicPageContent }) {
  return (
    <main className="public-info-page">
      <header className="public-info-header">
        <Link href="/" className="public-info-brand" aria-label="ByteShelf home">
          <BrandMark size={30} />
          <span>ByteShelf</span>
        </Link>
        <nav aria-label="Public pages">
          {publicPageLinks.slice(0, 5).map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </header>

      <section className="public-info-hero">
        <p className="public-info-eyebrow">{page.eyebrow ?? "ByteShelf"}</p>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        {page.ctaHref && page.ctaLabel ? (
          <Link href={page.ctaHref} className="btn btn-primary">{page.ctaLabel}</Link>
        ) : null}
      </section>

      <section className="public-info-content" aria-label={`${page.title} details`}>
        {page.sections.map((section) => (
          <article key={section.title} className="public-info-card">
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <footer className="public-info-footer">
        <div>
          <strong>ByteShelf</strong>
          <span>&copy; {new Date().getFullYear()} ByteShelf. All rights reserved.</span>
        </div>
        <nav aria-label="Legal pages">
          {[...publicPageLinks, ...legalPageLinks].map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}
