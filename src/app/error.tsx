"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="system-message-page" aria-labelledby="error-title">
      <div className="system-message-card">
        <span className="system-message-icon system-message-icon-error" aria-hidden="true">
          <AlertTriangle size={24} />
        </span>
        <p className="system-message-eyebrow">Something went wrong</p>
        <h1 id="error-title">We couldn’t load this page</h1>
        <p className="system-message-copy">
          Your saved entries haven’t been changed. Try again, or return to your library.
        </p>
        <div className="system-message-actions">
          <button className="btn btn-primary" type="button" onClick={reset}>
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
          <Link href="/dashboard" className="btn btn-secondary">Back to library</Link>
        </div>
      </div>
    </main>
  );
}
