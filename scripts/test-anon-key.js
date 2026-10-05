const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjQ0OTMsImV4cCI6MjEwNjQ0MDQ5M30.tB-CC1UJt6iMBjTAsJfT88p3b_4mmPPBaGPZoja-8Dg';

const supabase = createClient(supabaseUrl, anonKey);

async function testAnonKey() {
  console.log('Testing anon key...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', anonKey.substring(0, 50) + '...\n');

  try {
    // Try to list categories (should work with anon key)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Anon key test FAILED:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('✅ Anon key test PASSED');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testAnonKey();
