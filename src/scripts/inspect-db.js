const fs = require('fs');
const path = require('path');

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

  console.log('Fetching REST API definitions from:', supabaseUrl);
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`);
  const swagger = await res.json();
  
  if (swagger && swagger.definitions) {
    for (const tableName of Object.keys(swagger.definitions)) {
      console.log(`\nTable: ${tableName}`);
      const def = swagger.definitions[tableName];
      if (def.properties) {
        for (const propName of Object.keys(def.properties)) {
          const prop = def.properties[propName];
          console.log(`  - ${propName}: ${prop.type} (${prop.format || ''}) ${prop.description || ''}`);
        }
      }
    }
  } else {
    console.log('Failed to fetch swagger definitions', swagger);
  }
}

main().catch(err => {
  console.error(err);
});
