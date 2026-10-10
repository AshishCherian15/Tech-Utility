"use client";

export default function EntryCardSkeleton() {
  return (
    <div className="entry-card" style={{ background: "var(--bg-card)", pointerEvents: "none" }}>
      {/* Image banner placeholder */}
      <div
        style={{
          margin: "-16px -16px 12px -16px",
          height: 130,
          background: "var(--bg-muted)",
          borderBottom: "1px solid var(--border-card)",
        }}
        className="shimmer"
      />

      <div className="entry-card-header">
        <div className="entry-card-meta">
          <div
            style={{
              width: 50,
              height: 18,
              borderRadius: 4,
              background: "var(--bg-muted)",
            }}
            className="shimmer"
          />
          <div
            style={{
              width: 40,
              height: 12,
              borderRadius: 4,
              background: "var(--bg-muted)",
            }}
            className="shimmer"
          />
        </div>
        <div className="entry-card-actions">
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: "var(--bg-muted)",
            }}
            className="shimmer"
          />
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: "var(--bg-muted)",
            }}
            className="shimmer"
          />
        </div>
      </div>

      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          margin: "0 0 8px 0",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            width: "70%",
            height: 20,
            borderRadius: 4,
            background: "var(--bg-muted)",
          }}
          className="shimmer"
        />
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 14,
            borderRadius: 4,
            background: "var(--bg-muted)",
            marginBottom: 6,
          }}
          className="shimmer"
        />
        <div
          style={{
            width: "60%",
            height: 14,
            borderRadius: 4,
            background: "var(--bg-muted)",
          }}
          className="shimmer"
        />
      </p>

      <div className="entry-card-footer">
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            width: 80,
            height: 12,
            borderRadius: 4,
            background: "var(--bg-muted)",
          }}
          className="shimmer"
        />
      </div>
    </div>
  );
}
