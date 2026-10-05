const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';
const ownerEmail = 'ashishcherian15@gmail.com';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function provisionOwner() {
  console.log(`Provisioning owner account: ${ownerEmail}`);

  // Method 1: Try using auth.admin.updateUserById
  // First, we need to get the user ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === ownerEmail.toLowerCase());

  if (!user) {
    console.error(`User ${ownerEmail} not found. Please sign in with Google first.`);
    return;
  }

  console.log(`Found user: ${user.email} (ID: ${user.id})`);
  console.log(`Current metadata:`, user.user_metadata);
  console.log(`Current app_metadata:`, user.app_metadata);

  // Update the user with owner metadata
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      role: 'owner',
      account_type: 'permanent',
      enabled: true,
      expires_at: null
    }
  });

  if (error) {
    console.error('Error updating user:', error);
    return;
  }

  console.log('✅ User updated successfully!');
  console.log('New app_metadata:', data.user.app_metadata);
  console.log('\nPlease sign out and sign in again with Google.');
}

provisionOwner();
