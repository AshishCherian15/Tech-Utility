function SkeletonLine({ className }: { className: string }) {
  return <div aria-hidden="true" className={`skeleton skeleton-line ${className}`} />;
}

export default function AppLoading() {
  return (
    <main className="dashboard" aria-busy="true" aria-label="Loading dashboard">
      <section className="dashboard-hero" aria-hidden="true">
        <div className="dashboard-hero-content">
          <SkeletonLine className="skeleton-line-short" />
          <div className="skeleton skeleton-line" style={{ width: 260, height: 34, margin: "8px 0 12px" }} />
          <SkeletonLine className="skeleton-line-medium" />
          <div className="skeleton skeleton-block" style={{ maxWidth: 620, margin: "24px 0 18px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton" style={{ width: item === 0 ? 66 : 104, height: 36, borderRadius: 9999 }} />
            ))}
          </div>
        </div>
      </section>
      <section className="dashboard-entries" aria-hidden="true">
        <div className="entry-grid">
          {Array.from({ length: 6 }, (_, item) => (
            <div className="skeleton-card" key={item}>
              <SkeletonLine className="skeleton-line-short" />
              <SkeletonLine className="skeleton-line-medium" />
              <SkeletonLine className="skeleton-line-long" />
              <div className="skeleton skeleton-block" />
              <SkeletonLine className="skeleton-line-medium" />
            </div>
          ))}
        </div>
      </section>
      <span className="visually-hidden" role="status" aria-live="polite">Loading your entries…</span>
    </main>
  );
}
