import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="system-message-page">
      <div className="system-message-card">
        <span className="system-message-icon" aria-hidden="true"><SearchX size={24} /></span>
        <p className="system-message-eyebrow">404 · Page not found</p>
        <h1>This page isn’t here</h1>
        <p className="system-message-copy">
          The link may be outdated, or the page may have moved. Your saved entries are still safe.
        </p>
        <div className="system-message-actions">
          <Link href="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to library
          </Link>
          <Link href="/login" className="btn btn-secondary">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
