const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugAccount() {
  const targetEmail = 'admin123@gmail.com';

  console.log(`Debugging account: ${targetEmail}\n`);

  // List all users
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

  console.log('✅ User found');
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  console.log('Email confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
  console.log('Created at:', user.created_at);
  console.log('Last sign in:', user.last_sign_in_at);
  console.log('\nUser metadata:', JSON.stringify(user.user_metadata, null, 2));
  console.log('\nApp metadata:', JSON.stringify(user.app_metadata, null, 2));

  // Check if the user has a password set
  console.log('\n--- Checking password status ---');
  console.log('User has password:', user.encrypted_password ? 'YES' : 'NO');

  // If no password, ask user to provide it
  if (!user.encrypted_password) {
    console.log('\n⚠️  This user does not have a password set!');
    console.log('Please provide the password you used when creating the account:');
    console.log('Then I will update it using the admin API.');
    return;
  }

  // Try to sign in with a test password
  console.log('\n--- Testing sign-in with common password patterns ---');
  const testPasswords = [
    'Admin@12345678',
    'admin123@gmail.com',
    'admin123',
    'Admin123',
    'admin@123',
  ];

  for (const pwd of testPasswords) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: pwd,
    });

    if (!signInError) {
      console.log(`✅ Sign-in successful with password: "${pwd}"`);
      console.log('Session:', signInData.session ? 'YES' : 'NO');
      return;
    } else {
      console.log(`❌ Failed with "${pwd}": ${signInError.message}`);
    }
  }

  console.log('\n❌ None of the common passwords worked.');
  console.log('The password you set may not have been saved correctly.');
  console.log('\nYou can reset the password by running:');
  console.log('UPDATE auth.users SET encrypted_password = NULL WHERE email = \'admin123@gmail.com\';');
  console.log('Then create a new password reset link or recreate the account.');
}

debugAccount();
