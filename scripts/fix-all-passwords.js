const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAllPasswords() {
  console.log('Fixing passwords for all provisioned users...\n');

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const provisionedUsers = users.filter(u => u.app_metadata?.role && u.app_metadata?.account_type);

  console.log(`Found ${provisionedUsers.length} provisioned users\n`);

  for (const user of provisionedUsers) {
    console.log(`Checking: ${user.email}`);

    // Ensure they have can_create_entries and can_edit_delete_entries
    const updateData = {
      app_metadata: {
        ...user.app_metadata,
        can_create_entries: user.app_metadata.can_create_entries ?? true,
        can_edit_delete_entries: user.app_metadata.can_edit_delete_entries ?? true,
      }
    };

    const { data, error } = await supabase.auth.admin.updateUserById(user.id, updateData);

    if (error) {
      console.error(`  ❌ Failed to update: ${error.message}`);
    } else {
      console.log(`  ✅ Updated metadata for ${user.email}`);
    }
  }

  console.log('\n✅ All user metadata updated');
  console.log('\nFor accounts without passwords, you need to:');
  console.log('1. Recreate the account with a password');
  console.log('2. Or manually set a password using the admin API');
}

fixAllPasswords();
