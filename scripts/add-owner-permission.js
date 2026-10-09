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

async function addOwnerPermission() {
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
