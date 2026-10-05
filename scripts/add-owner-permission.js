const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addOwnerPermission() {
  const ownerEmail = 'ashishcherian15@gmail.com';

  console.log(`Adding can_create_entries permission to owner: ${ownerEmail}\n`);

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

  console.log('Found user:', user.email);
  console.log('Current app_metadata:', JSON.stringify(user.app_metadata, null, 2));

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      can_create_entries: true,
    },
  });

  if (error) {
    console.error('❌ Error updating user:', error);
    return;
  }

  console.log('✅ Owner can_create_entries permission added');
  console.log('New app_metadata:', JSON.stringify(data.user.app_metadata, null, 2));
}

addOwnerPermission();
