"use client";

import { useState } from "react";

export default function DebugApiPage() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testDirectApi = async () => {
    setLoading(true);
    setResult(null);

    const url = 'https://cscrpfvvfnxoezzbegwz.supabase.co/auth/v1/token?grant_type=password';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjQ0OTMsImV4cCI6MjEwNjQ0MDQ5M30.tB-CC1UJt6iMBjTAsJfT88p3b_4mmPPBaGPZoja-8Dg';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'ashishcherian15@gmail.com',
          password: 'Owner@12345678',
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Direct API Test</h1>
      <button onClick={testDirectApi} disabled={loading}>
        {loading ? 'Testing...' : 'Test Direct API Call'}
      </button>
      {result && (
        <div style={{ marginTop: 20, background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
          <h3>Result:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
