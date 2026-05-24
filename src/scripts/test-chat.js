const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found!');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value.trim();
    }
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('Testing insertion of a message into messages table...');
  const { data, error } = await supabase.from('messages').insert({
    sender_role: 'USER',
    content: 'Test message from script',
    product_id: 'session-test-random-123'
  }).select();

  if (error) {
    console.error('Error inserting message:', error);
  } else {
    console.log('Success!', data);
    // Cleanup
    const { error: deleteError } = await supabase.from('messages').delete().eq('content', 'Test message from script');
    if (deleteError) {
      console.error('Error deleting test message:', deleteError);
    } else {
      console.log('Cleanup successful');
    }
  }
}

main().catch(err => {
  console.error(err);
});
