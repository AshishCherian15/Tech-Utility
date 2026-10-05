const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkOwner() {
  const ownerEmail = 'ashishcherian15@gmail.com';

  console.log('Checking owner account...\n');

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === ownerEmail.toLowerCase());

  if (!user) {
    console.error(`User ${ownerEmail} not found`);
    return;
  }

  console.log('✅ Owner Account Found:');
  console.log('Email:', user.email);
  console.log('User ID:', user.id);
  console.log('Username:', user.user_metadata?.username || 'Not set');
  console.log('Full Name:', user.user_metadata?.full_name || 'Not set');
  console.log('Provider:', user.app_metadata?.provider || 'Not set');
  console.log('Role:', user.app_metadata?.role || 'Not set');
  console.log('Account Type:', user.app_metadata?.account_type || 'Not set');
  console.log('Enabled:', user.app_metadata?.enabled);
  console.log('Can Create Entries:', user.app_metadata?.can_create_entries);
  console.log('Can Edit/Delete Entries:', user.app_metadata?.can_edit_delete_entries);
  console.log('Expires At:', user.app_metadata?.expires_at || 'Never');
  console.log('Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
  console.log('Last Sign In:', user.last_sign_in_at || 'Never');
  console.log('Created At:', user.created_at);
  console.log('\nNote: Google OAuth users may not have a traditional password set.');
  console.log('The password Owner@12345678 was set manually via admin API.');
}

checkOwner();
