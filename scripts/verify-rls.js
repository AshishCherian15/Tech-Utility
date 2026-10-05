const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyRLS() {
  console.log('Checking RLS function and user metadata...\n');

  // Get the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === 'ashishcherian15@gmail.com'.toLowerCase());

  if (!user) {
    console.error('User not found');
    return;
  }

  console.log('User:', user.email);
  console.log('User ID:', user.id);
  console.log('\nRaw app_metadata:', JSON.stringify(user.app_metadata, null, 2));
  console.log('\nEnabled value type:', typeof user.app_metadata?.enabled);
  console.log('Enabled value:', user.app_metadata?.enabled);

  // Check if enabled is a boolean
  const isEnabled = user.app_metadata?.enabled === true || user.app_metadata?.enabled === 'true';
  console.log('\nIs enabled (parsed):', isEnabled);

  // Now simulate the RLS check
  const check = `
    SELECT
      (raw_app_meta_data ->> 'enabled')::BOOLEAN as enabled_bool,
      raw_app_meta_data ->> 'enabled' as enabled_raw,
      raw_app_meta_data ->> 'role' as role,
      raw_app_meta_data ->> 'account_type' as account_type,
      raw_app_meta_data ->> 'expires_at' as expires_at
    FROM auth.users
    WHERE id = '${user.id}'
  `;

  console.log('\n--- Simulating RLS check ---');
  console.log('Running:', check);

  const { data: checkData, error: checkError } = await supabase
    .rpc('exec_sql', { sql: check });

  if (checkError) {
    console.error('RPC check failed (expected):', checkError.message);
    console.log('Let me try a different approach...');
  } else {
    console.log('Check result:', checkData);
  }

  // Try to query categories as the user to see if RLS blocks it
  console.log('\n--- Testing RLS with categories table ---');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id);

  if (catError) {
    console.error('Categories query error:', catError);
  } else {
    console.log('Categories query succeeded (no rows is expected for new user):', categories);
  }
}

verifyRLS();
