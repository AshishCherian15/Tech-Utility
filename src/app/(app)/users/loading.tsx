export default function UsersLoading() {
  return (
    <main aria-busy="true" aria-label="Loading user accounts" className="users-page">
      <div className="skeleton" style={{ width: 280, height: 34, marginBottom: 14 }} />
      <div className="skeleton" style={{ width: "min(100%, 520px)", height: 18, marginBottom: 28 }} />
      <div className="skeleton" style={{ height: 150, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 260 }} />
      <span className="visually-hidden" role="status" aria-live="polite">Loading user accounts…</span>
    </main>
  );
}
