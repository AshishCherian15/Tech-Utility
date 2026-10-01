import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      background: "var(--bg-base)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        fontSize: 80,
        fontWeight: 800,
        background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
      }}>
        404
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>
        Page not found
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", maxWidth: 320 }}>
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
          color: "#fff",
          borderRadius: 10,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
