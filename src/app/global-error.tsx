"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 32, background: "#080c14", color: "#f1f5f9" }}>
        <main aria-labelledby="global-error-title" style={{ maxWidth: 560, margin: "15vh auto", display: "grid", gap: 16 }}>
          <p style={{ color: "#60a5fa", fontWeight: 700 }}>ByteShelf</p>
          <h1 id="global-error-title" style={{ margin: 0 }}>The app hit an unexpected error</h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>Try loading the app again. Your saved entries have not been changed by this error.</p>
          <button type="button" onClick={() => reset()} style={{ minHeight: 44, width: "fit-content", padding: "0 18px", border: 0, borderRadius: 10, color: "#fff", background: "#2563eb", cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
