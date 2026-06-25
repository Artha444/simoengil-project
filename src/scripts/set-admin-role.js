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
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
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
  // Get email from command line argument
  const targetEmail = process.argv[2];
  if (!targetEmail) {
    console.error('❌ Penggunaan: node set-admin-role.js <email>');
    console.error('   Contoh:    node set-admin-role.js admin@gmail.com');
    process.exit(1);
  }

  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local!');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Find the user by email
  console.log(`🔍 Searching for user: ${targetEmail}...`);
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Gagal mengambil daftar user:', listError.message);
    process.exit(1);
  }

  const user = usersData.users.find(u => u.email === targetEmail);
  if (!user) {
    console.error(`❌ User dengan email "${targetEmail}" tidak ditemukan di Supabase Auth!`);
    console.log('\n📋 Daftar user yang tersedia:');
    usersData.users.forEach(u => {
      console.log(`   - ${u.email} (role metadata: ${u.user_metadata?.role || 'tidak ada'})`);
    });
    process.exit(1);
  }

  console.log(`✅ User ditemukan: ${user.email}`);
  console.log(`   Current user_metadata:`, JSON.stringify(user.user_metadata));

  // Update user_metadata to include role: 'admin'
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: 'admin' }
  });

  if (updateError) {
    console.error('❌ Gagal mengupdate user metadata:', updateError.message);
    process.exit(1);
  }

  console.log(`\n🎉 Berhasil! User "${targetEmail}" sekarang memiliki role admin.`);
  console.log(`   Updated user_metadata:`, JSON.stringify(data.user.user_metadata));
  console.log(`\n💡 Sekarang Anda bisa login di: http://localhost:3000/_secure_admin_login`);
  
  // IMPORTANT: Also reset the system role back to 'authenticated' if it was changed
  // The 'role' column in auth.users should always be 'authenticated' for normal users
}

main().catch(err => {
  console.error('Unhandled error:', err);
});
