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
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value.trim();
    }
  });
  return env;
}

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Teddy Bear Klasik Cokelat',
    price: 89000,
    category: 'Boneka Beruang',
    image: '/images/plushie_teddy.png',
    status: 'Best Seller',
    description: 'Boneka Teddy Bear klasik berwarna cokelat hangat dengan bulu super halus dan empuk. Sangat cocok menemani tidur Anda atau dijadikan kado manis untuk orang tersayang.',
    rating: 4.9,
    reviewsCount: 142,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Premium Dacron Silikon Grade A & Bulu Rasfur Halus',
      size: 'Tinggi 35 cm, Lebar 25 cm',
      washing: 'Bisa dicuci dengan mesin (putaran lembut) atau cuci tangan',
      safeForKids: true
    },
    variants: [
      { size: "Medium (40cm)", price: 89000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Jumbo (100cm)", price: 189000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  },
  {
    id: '2',
    name: 'Bunny Kuping Panjang Pink',
    price: 95000,
    category: 'Boneka Beruang',
    image: '/images/plushie_bunny.png',
    status: 'Best Seller',
    description: 'Boneka kelinci lucu berwarna pink pastel dengan telinga panjang yang sangat lembut saat diraba. Didesain khusus agar nyaman dipeluk erat oleh si kecil maupun dewasa.',
    rating: 4.8,
    reviewsCount: 96,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Premium Dacron & Kain Velboa Super Lembut',
      size: 'Tinggi 40 cm (ujung telinga ke kaki), Lebar 20 cm',
      washing: 'Cuci tangan dengan air hangat hangat kuku dan sabun bayi',
      safeForKids: true
    },
    variants: [
      { size: "Medium (35cm)", price: 95000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Jumbo (80cm)", price: 199000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  },
  {
    id: '3',
    name: 'Dino Hijau Imut Spiky',
    price: 110000,
    category: 'Boneka Beruang',
    image: '/images/plushie_dino.png',
    status: 'Stok Terbatas',
    description: 'Boneka dinosaurus bayi berwarna hijau cerah dengan ornamen gerigi kuning lembut di punggungnya. Teman berpetualang yang tangguh namun sangat ramah pelukan!',
    rating: 5.0,
    reviewsCount: 64,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Premium Dacron Grade A & Kain Spandex Lembut elastis',
      size: 'Panjang 38 cm, Tinggi 22 cm',
      washing: 'Cukup diusap dengan kain basah hangat atau cuci tangan lembut',
      safeForKids: true
    },
    variants: [
      { size: "Medium (38cm)", price: 110000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Jumbo (80cm)", price: 210000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  },
  {
    id: '4',
    name: 'Mochi Neko Squishy Bulat',
    price: 79000,
    category: 'Boneka Beruang',
    image: '/images/plushie_neko.png',
    status: 'Stok Terbatas',
    description: 'Boneka kucing putih bulat super squishy dengan tekstur selembut kue mochi. Sangat seru ditekan-tekan, empuk luar biasa, dan bisa berfungsi sebagai bantal leher nyaman.',
    rating: 4.7,
    reviewsCount: 81,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: 'Isian Microfiber Bulu Angsa Sintetis & Kain Spandex Elastis premium',
      size: 'Diameter 30 cm',
      washing: 'Bisa dicuci mesin cuci dengan laundry bag putaran rendah',
      safeForKids: true
    },
    variants: [
      { size: "Squishy (30cm)", price: 79000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Super Jumbo (60cm)", price: 159000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  },
  {
    id: '5',
    name: 'Teddy Bear Kado Wisuda',
    price: 125000,
    category: 'Kado Wisuda',
    image: '/images/plushie_grad_bear.png',
    status: 'Baru',
    description: 'Teddy Bear spesial wisuda lengkap dengan topi toga hitam berkuncir dan gulungan ijazah dengan pita merah cantik. Hadiah kelulusan terbaik yang awet dan manis.',
    rating: 4.9,
    reviewsCount: 52,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Premium Dacron & Bulu Snail Mawar Bertekstur Indah',
      size: 'Tinggi 35 cm (posisi duduk)',
      washing: 'Dicuci kering (dry clean) disarankan, toga dapat dilepas',
      safeForKids: true
    },
    variants: [
      { size: "Medium (35cm)", price: 125000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Jumbo (70cm)", price: 249000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  },
  {
    id: '6',
    name: 'Gantungan Kunci Fluffy Bear',
    price: 29000,
    category: 'Gantungan Kunci',
    image: '/images/plushie_keychain_bear.png',
    status: 'Best Seller',
    description: 'Gantungan kunci boneka beruang mini yang sangat empuk dan berbulu lebat. Dilengkapi gantungan kunci logam anti karat kuat untuk tas ransel maupun kunci kendaraan.',
    rating: 4.9,
    reviewsCount: 215,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: 'Dacron Premium Silikon & Bulu Rasfur Halus',
      size: 'Tinggi 12 cm',
      washing: 'Cuci tangan secara perlahan menggunakan sikat gigi lembut',
      safeForKids: true
    },
    variants: [
      { size: "Mini (12cm)", price: 29000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  },
  {
    id: '7',
    name: 'Gantungan Kunci Fluffy Bunny',
    price: 29000,
    category: 'Gantungan Kunci',
    image: '/images/plushie_keychain_bunny.png',
    status: 'Baru',
    description: 'Gantungan kunci boneka kelinci putih mini yang imut dengan detail telinga bagian dalam berwarna pink lembut. Menambah sentuhan gemas di tas sekolah atau ransel kerjamu.',
    rating: 4.7,
    reviewsCount: 38,
    shopeeLink: 'https://shopee.co.id',
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: 'Dacron Premium Silikon & Bulu Yelvo Halus',
      size: 'Tinggi 12 cm',
      washing: 'Cuci tangan perlahan dengan air sabun ringan',
      safeForKids: true
    },
    variants: [
      { size: "Mini (12cm)", price: 29000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  }
];

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('Mapping seed products to DB schema...');
  const dbProducts = MOCK_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    status: p.status,
    description: p.description,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    shopee_link: p.shopeeLink,
    tokopedia_link: p.tokopediaLink,
    specifications: p.specifications,
    variants: p.variants
  }));

  console.log(`Upserting ${dbProducts.length} products to database...`);
  const { data, error } = await supabase.from('products').upsert(dbProducts);

  if (error) {
    console.error('Failed to seed products:', error.message);
    process.exit(1);
  }

  console.log('🎉 Seeded products table successfully!');
}

main().catch(err => {
  console.error(err);
});
