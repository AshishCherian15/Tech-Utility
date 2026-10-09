const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAccountCreation() {
  const testEmail = 'testuser@byteshelf.test';
  const testPassword = 'Test@12345678';
  const testUsername = 'testuser';

  console.log('Testing account creation with password...\n');

  // First, delete if exists
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existing = users.find(u => u.email?.toLowerCase() === testEmail.toLowerCase());
  if (existing) {
    console.log('Deleting existing test account...');
    await supabase.auth.admin.deleteUser(existing.id);
  }

  // Create new account
  console.log('Creating new account...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { username: testUsername },
    app_metadata: {
      role: 'permanent_user',
      account_type: 'permanent',
      enabled: true,
      expires_at: null,
    },
  });

  if (error) {
    console.error('❌ Creation failed:', error.message);
    return;
  }

  console.log('✅ Account created');
  console.log('User ID:', data.user.id);

  // Verify password was set
  const { data: userCheck, error: checkError } = await supabase.auth.admin.getUserById(data.user.id);
  if (checkError) {
    console.error('❌ Could not verify user:', checkError);
    return;
  }

  console.log('Password set:', userCheck.user.encrypted_password ? 'YES' : 'NO');

  // If not set, update it
  if (!userCheck.user.encrypted_password) {
    console.log('Password not set, updating manually...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
      password: testPassword,
    });
    if (updateError) {
      console.error('❌ Failed to set password:', updateError);
      return;
    }
    console.log('✅ Password set manually');
  }

  // Test sign-in
  console.log('\nTesting sign-in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('❌ Sign-in failed:', signInError.message);
    return;
  }

  console.log('✅ Sign-in successful!');
  console.log('Session created:', signInData.session ? 'YES' : 'NO');

  // Clean up
  console.log('\nCleaning up test account...');
  await supabase.auth.admin.deleteUser(data.user.id);
  console.log('✅ Test account deleted');

  console.log('\n✅ Account creation and login works correctly!');
}

testAccountCreation();
