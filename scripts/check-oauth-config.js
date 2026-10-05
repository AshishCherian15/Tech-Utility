const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkOAuthConfig() {
  console.log('Checking OAuth configuration...\n');

  try {
    // Try to get the project settings
    const { data, error } = await supabase
      .from('_supabase_config')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Cannot access config table directly (expected)');
    }

    console.log('\n=== OAuth Configuration Checklist ===\n');
    console.log('Please verify the following in your Supabase Dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/cscrpfvvfnxoezzbegwz/auth/providers');
    console.log('2. Check Google provider is ENABLED');
    console.log('3. Click "Edit" on Google provider');
    console.log('4. Check the "Redirect URL" shown there');
    console.log('5. Add this Redirect URL to your Google Cloud Console OAuth 2.0 Client:');
    console.log('   - Go to: https://console.cloud.google.com/apis/credentials');
    console.log('   - Find your OAuth 2.0 Client ID');
    console.log('   - Add the Supabase Redirect URL to "Authorized redirect URIs"\n');
    console.log('6. In Supabase Dashboard → Authentication → URL Configuration:');
    console.log('   - Site URL: http://localhost:3000');
    console.log('   - Redirect URLs: http://localhost:3000/auth/callback\n');
    console.log('7. Test in an incognito/private browser window\n');

  } catch (err) {
    console.error('Error:', err);
  }
}

checkOAuthConfig();
