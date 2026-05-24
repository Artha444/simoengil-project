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

  console.log('Querying last 5 orders...');
  const { data, error } = await supabase.from('orders').select('*').limit(5);
  
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Orders found:', data.length);
    data.forEach((o, i) => {
      console.log(`\nOrder #${i + 1}:`);
      console.log(`  ID: ${o.id}`);
      console.log(`  Status: ${o.status}`);
      console.log(`  Shipping Address Type: ${typeof o.shipping_address}`);
      console.log(`  Shipping Address:`, o.shipping_address);
    });
  }
}

main().catch(err => {
  console.error(err);
});
