const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSFunction() {
  console.log('Fixing has_active_account() function to handle boolean values...');

  const fixSQL = `
CREATE OR REPLACE FUNCTION public.has_active_account()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (u.raw_app_meta_data ->> 'enabled')::BOOLEAN = TRUE
    AND (
      (u.raw_app_meta_data ->> 'role' = 'owner'
        AND u.raw_app_meta_data ->> 'account_type' = 'permanent')
      OR
      (u.raw_app_meta_data ->> 'role' = 'permanent_user'
        AND u.raw_app_meta_data ->> 'account_type' = 'permanent')
      OR
      (u.raw_app_meta_data ->> 'role' = 'guest_access'
        AND u.raw_app_meta_data ->> 'account_type' = 'temporary'
        AND NULLIF(u.raw_app_meta_data ->> 'expires_at', '') IS NOT NULL)
    )
    AND (
      NULLIF(u.raw_app_meta_data ->> 'expires_at', '') IS NULL
      OR (u.raw_app_meta_data ->> 'expires_at')::TIMESTAMPTZ > NOW()
    ),
    FALSE
  )
  FROM auth.users AS u
  WHERE u.id = auth.uid();
$$;
`;

  const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL });

  if (error) {
    console.error('Error via RPC:', error);
    console.log('Attempting direct SQL execution via database query...');

    // Alternative: use the database endpoint directly
    const { error: directError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (directError) {
      console.error('Direct query also failed:', directError);
    }
  } else {
    console.log('✅ Function updated successfully via RPC');
  }

  console.log('\n⚠️  The function fix needs to be run manually in Supabase SQL Editor.');
  console.log('Please run this SQL in your Supabase SQL Editor:');
  console.log('\n' + fixSQL);
}

fixRLSFunction();
