const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cscrpfvvfnxoezzbegwz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2NDQ5MywiZXhwIjoyMTA2NDQwNDkzfQ.jL0Ed41EeQrjFLgoyvi1VD7NGU9eh5Te74tGuYKLDCE';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addWindowsGuide() {
  const ownerId = 'cfd69053-b97e-4384-b912-83ce6c4e64db';

  const entry = {
    title: 'Windows Troubleshooting Guide - Essential CMD & PowerShell Commands',
    type: 'Guide',
    tags: ['Windows', 'CMD', 'PowerShell', 'Troubleshooting', 'System', 'Network', 'Security', 'Performance'],
    what_it_is: 'A comprehensive collection of essential CMD and PowerShell commands for Windows troubleshooting, security, disk management, boot recovery, network repair, performance optimization, and system health.',
    why_useful: 'Provides quick reference commands for diagnosing and fixing common Windows issues without needing third-party tools. Essential for system administrators, IT professionals, and power users.',
    who_can_use: 'System administrators, IT professionals, developers, power users, and anyone who needs to troubleshoot Windows systems.',
    when_to_use: 'When experiencing system issues, performance problems, network connectivity problems, security concerns, or when performing routine system maintenance and optimization.',
    how_to_use: 'Open Command Prompt or PowerShell with administrator privileges. Copy and paste the relevant command. Use \`-h\` or \`/?\` flag for help on any command. Backup system before running critical repair commands.',
    example: 'Example: To check firewall status, run: netsh advfirewall show allprofiles\nTo clear DNS cache: ipconfig /flushdns\nTo scan system files: sfc /scannow',
    user_id: ownerId,
  };

  console.log('Adding Windows Troubleshooting Guide entry...\n');

  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('❌ Error adding entry:', error);
    return;
  }

  console.log('✅ Entry added successfully!');
  console.log('Entry ID:', data.id);
  console.log('Title:', data.title);
  console.log('\nYou can now view this entry in your dashboard.');
}

addWindowsGuide();
