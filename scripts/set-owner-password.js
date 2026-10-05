const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setOwnerPassword() {
  const ownerEmail = 'ashishcherian15@gmail.com';
  const newPassword = 'Owner@12345678'; // You can change this

  console.log(`Setting password for owner: ${ownerEmail}`);
  console.log(`New password: ${newPassword}\n`);

  // Get the user
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
  console.log('User ID:', user.id);
  console.log('Current provider:', user.app_metadata?.provider);

  // Update the user with a password
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });

  if (error) {
    console.error('❌ Error updating password:', error);
    return;
  }

  console.log('✅ Password updated successfully!');
  console.log('\nYou can now sign in with:');
  console.log(`Email: ${ownerEmail}`);
  console.log(`Password: ${newPassword}`);
  console.log('\nNote: Google OAuth will still work. You can use either method.');
}

setOwnerPassword();
