"use client";

export default function DebugEnvPage() {
  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
        <h3>NEXT_PUBLIC_SUPABASE_URL:</h3>
        <pre>{process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</pre>
        <h3>NEXT_PUBLIC_SUPABASE_ANON_KEY:</h3>
        <pre>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50) + '...' : 'NOT SET'}</pre>
        <h3>NEXT_PUBLIC_APP_URL:</h3>
        <pre>{process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}</pre>
      </div>
    </div>
  );
}
