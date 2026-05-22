const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load env vars manually from .env.local
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
      // Remove surrounding quotes if any
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

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local!');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = 'admin@simoengil.com';
  const password = 'adminPassword123'; // Default secure password, you can change this

  console.log(`Attempting to create admin user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('registered')) {
      console.log(`User ${email} already exists. Setting/updating password instead...`);
      // Find the user first
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('Failed to list users:', listError.message);
        process.exit(1);
      }
      const user = usersData.users.find(u => u.email === email);
      if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: password,
          user_metadata: { role: 'admin' }
        });
        if (updateError) {
          console.error('Failed to update password:', updateError.message);
          process.exit(1);
        }
        console.log('🎉 Password updated successfully!');
      } else {
        console.error('User not found in list.');
        process.exit(1);
      }
    } else {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }
  } else {
    console.log('🎉 Admin user created successfully!');
  }

  console.log('\nUse these credentials to log in:');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

main().catch(err => {
  console.error('Unhandled error:', err);
});
