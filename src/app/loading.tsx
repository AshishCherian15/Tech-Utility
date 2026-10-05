export default function Loading() {
  return (
    <main id="main-content" aria-busy="true" aria-label="Loading page" style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="skeleton" style={{ width: 240, height: 36, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "min(100%, 520px)", height: 18, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="skeleton" style={{ height: 190, borderRadius: "var(--radius-lg)" }} />
        ))}
      </div>
      <span
        role="status"
        aria-live="polite"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      >
        Loading content…
      </span>
    </main>
  );
}
