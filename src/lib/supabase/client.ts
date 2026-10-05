import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing Supabase environment variables:', {
      url: url ? 'SET' : 'MISSING',
      key: key ? 'SET' : 'MISSING',
    });
    throw new Error('Missing Supabase environment variables');
  }

  console.log('Supabase Client Init:', {
    url: url.substring(0, 30) + '...',
    key: key.substring(0, 50) + '...',
    keyLength: key.length,
  });

  const client = createBrowserClient(url, key);

  // Add auth state change listener to debug
  client.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
  });

  return client;
}
