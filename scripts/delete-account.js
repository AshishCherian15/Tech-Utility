const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAccount() {
  const targetEmail = 'admin123@gmail.com';

  console.log(`Deleting account: ${targetEmail}\n`);

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

  if (!user) {
    console.error(`User ${targetEmail} not found`);
    return;
  }

  console.log('Found user:', user.email);
  console.log('User ID:', user.id);

  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('❌ Error deleting user:', error);
    return;
  }

  console.log('✅ Account deleted successfully');
  console.log('\nPlease recreate the account from Settings to ensure it has a working password.');
}

deleteAccount();
