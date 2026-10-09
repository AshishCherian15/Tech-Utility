const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail = process.env.BYTESHELF_ADMIN_EMAIL;

if (!supabaseUrl || !serviceRoleKey || !ownerEmail) {
  throw new Error(
    'Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and BYTESHELF_ADMIN_EMAIL before running this script.'
  );
}

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
