export default function UsersLoading() {
  return (
    <main aria-busy="true" aria-label="Loading user accounts" className="users-page">
      <div className="skeleton" aria-hidden="true" style={{ width: 280, height: 34, borderRadius: 8, marginBottom: 14 }} />
      <div className="skeleton" aria-hidden="true" style={{ width: "min(100%, 520px)", height: 18, borderRadius: 8, marginBottom: 28 }} />
      <section className="skeleton-card" aria-hidden="true" style={{ minHeight: 132, marginBottom: 20 }}>
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-line skeleton-line-medium" />
        <div className="skeleton skeleton-line skeleton-line-long" />
      </section>
      <section className="skeleton-card" aria-hidden="true" style={{ minHeight: 260 }}>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--border-card)" }}>
            <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "grid", gap: 8 }}>
              <div className="skeleton skeleton-line skeleton-line-medium" />
              <div className="skeleton skeleton-line skeleton-line-short" />
            </div>
            <div className="skeleton" style={{ width: 78, height: 32, borderRadius: 8 }} />
          </div>
        ))}
      </section>
      <span className="visually-hidden" role="status" aria-live="polite">Loading user accounts…</span>
    </main>
  );
}
