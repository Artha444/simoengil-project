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

  console.log('Querying columns for "products" table...');
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'products' });
  
  if (error) {
    // If rpc doesn't exist, we can try to do a generic select or check metadata
    console.log('RPC get_table_columns not found, checking metadata by selecting postgrest schema...');
    // We can fetch from a postgrest endpoint directly
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`);
    const swagger = await res.json();
    if (swagger && swagger.definitions && swagger.definitions.products) {
      console.log('Columns in products definition:', Object.keys(swagger.definitions.products.properties));
    } else {
      console.log('Failed to fetch swagger, let\'s try to insert a dummy product to see errors or just check what fields are supported.');
      const { error: insertError } = await supabase.from('products').insert({ id: '99999999-9999-9999-9999-999999999999', name: 'Test' });
      console.log('Insert response error (if any):', insertError);
      // cleanup
      await supabase.from('products').delete().eq('id', '99999999-9999-9999-9999-999999999999');
    }
  } else {
    console.log('Table columns:', data);
  }
}

main().catch(err => {
  console.error(err);
});
