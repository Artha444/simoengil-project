export interface ProductSpecification {
  material: string;
  size: string;
  washing: string;
  safeForKids: boolean;
  shopeePrice?: number;
  tokopediaPrice?: number;
  lazadaPrice?: number;
  tiktokPrice?: number;
  lazadaLink?: string;
  tiktokLink?: string;
  shopeeAvailable?: boolean;
  tokopediaAvailable?: boolean;
  lazadaAvailable?: boolean;
  tiktokAvailable?: boolean;
  images?: string[];
  features?: string[];
}

export interface ProductVariant {
  size: string;
  price?: number;
  shopeePrice?: number;
  tokopediaPrice?: number;
  lazadaPrice?: number;
  tiktokPrice?: number;
  shopeeUrl: string;
  tokopediaUrl: string;
  lazadaUrl?: string;
  tiktokUrl?: string;
  shopeeAvailable?: boolean;
  tokopediaAvailable?: boolean;
  lazadaAvailable?: boolean;
  tiktokAvailable?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  status: 'Best Seller' | 'Stok Terbatas' | 'Baru' | 'Promo';
  description: string;
  rating: number;
  reviewsCount: number;
  shopeeLink: string;
  tokopediaLink: string;
  lazadaLink?: string;
  tiktokLink?: string;
  shopeePrice?: number;
  tokopediaPrice?: number;
  lazadaPrice?: number;
  tiktokPrice?: number;
  shopeeAvailable?: boolean;
  tokopediaAvailable?: boolean;
  lazadaAvailable?: boolean;
  tiktokAvailable?: boolean;
  images?: string[];
  specifications: ProductSpecification;
  variants?: ProductVariant[];
}

export const PRODUCTS: Product[] = [
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 94000,
    tokopediaPrice: 89000,
    lazadaPrice: 89000,
    tiktokPrice: 91000,
    specifications: {
      material: '100% Premium Dacron Silikon Grade A & Bulu Rasfur Halus',
      size: 'Tinggi 35 cm, Lebar 25 cm',
      washing: 'Bisa dicuci dengan mesin (putaran lembut) atau cuci tangan',
      safeForKids: true
    },
    variants: [
      { size: "Medium (40cm)", price: 89000, shopeePrice: 94000, tokopediaPrice: 89000, lazadaPrice: 89000, tiktokPrice: 91000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" },
      { size: "Jumbo (100cm)", price: 189000, shopeePrice: 199000, tokopediaPrice: 189000, lazadaPrice: 189000, tiktokPrice: 194000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 99000,
    tokopediaPrice: 95000,
    lazadaPrice: 95000,
    tiktokPrice: 97000,
    specifications: {
      material: '100% Premium Dacron & Kain Velboa Super Lembut',
      size: 'Tinggi 40 cm (ujung telinga ke kaki), Lebar 20 cm',
      washing: 'Cuci tangan dengan air hangat hangat kuku dan sabun bayi',
      safeForKids: true
    },
    variants: [
      { size: "Medium (35cm)", price: 95000, shopeePrice: 99000, tokopediaPrice: 95000, lazadaPrice: 95000, tiktokPrice: 97000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" },
      { size: "Jumbo (80cm)", price: 199000, shopeePrice: 209000, tokopediaPrice: 199000, lazadaPrice: 199000, tiktokPrice: 204000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 115000,
    tokopediaPrice: 110000,
    lazadaPrice: 110000,
    tiktokPrice: 112000,
    specifications: {
      material: '100% Premium Dacron Grade A & Kain Spandex Lembut elastis',
      size: 'Panjang 38 cm, Tinggi 22 cm',
      washing: 'Cukup diusap dengan kain basah hangat atau cuci tangan lembut',
      safeForKids: true
    },
    variants: [
      { size: "Medium (38cm)", price: 110000, shopeePrice: 115000, tokopediaPrice: 110000, lazadaPrice: 110000, tiktokPrice: 112000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" },
      { size: "Jumbo (80cm)", price: 210000, shopeePrice: 220000, tokopediaPrice: 210000, lazadaPrice: 210000, tiktokPrice: 215000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 84000,
    tokopediaPrice: 79000,
    lazadaPrice: 79000,
    tiktokPrice: 81000,
    specifications: {
      material: 'Isian Microfiber Bulu Angsa Sintetis & Kain Spandex Elastis premium',
      size: 'Diameter 30 cm',
      washing: 'Bisa dicuci mesin cuci dengan laundry bag putaran rendah',
      safeForKids: true
    },
    variants: [
      { size: "Squishy (30cm)", price: 79000, shopeePrice: 84000, tokopediaPrice: 79000, lazadaPrice: 79000, tiktokPrice: 81000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" },
      { size: "Super Jumbo (60cm)", price: 159000, shopeePrice: 169000, tokopediaPrice: 159000, lazadaPrice: 159000, tiktokPrice: 164000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 135000,
    tokopediaPrice: 125000,
    lazadaPrice: 125000,
    tiktokPrice: 129000,
    specifications: {
      material: '100% Premium Dacron & Bulu Snail Mawar Bertekstur Indah',
      size: 'Tinggi 35 cm (posisi duduk)',
      washing: 'Dicuci kering (dry clean) disarankan, toga dapat dilepas',
      safeForKids: true
    },
    variants: [
      { size: "Medium (35cm)", price: 125000, shopeePrice: 135000, tokopediaPrice: 125000, lazadaPrice: 125000, tiktokPrice: 129000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" },
      { size: "Jumbo (70cm)", price: 249000, shopeePrice: 259000, tokopediaPrice: 249000, lazadaPrice: 249000, tiktokPrice: 254000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 34900,
    tokopediaPrice: 29000,
    lazadaPrice: 29000,
    tiktokPrice: 31900,
    specifications: {
      material: 'Dacron Premium Silikon & Bulu Rasfur Halus',
      size: 'Tinggi 12 cm',
      washing: 'Cuci tangan secara perlahan menggunakan sikat gigi lembut',
      safeForKids: true
    },
    variants: [
      { size: "Mini (12cm)", price: 29000, shopeePrice: 34900, tokopediaPrice: 29000, lazadaPrice: 29000, tiktokPrice: 31900, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
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
    lazadaLink: 'https://lazada.co.id',
    tiktokLink: 'https://tiktok.com',
    shopeePrice: 34900,
    tokopediaPrice: 29000,
    lazadaPrice: 29000,
    tiktokPrice: 31900,
    specifications: {
      material: 'Dacron Premium Silikon & Bulu Yelvo Halus',
      size: 'Tinggi 12 cm',
      washing: 'Cuci tangan perlahan dengan air sabun ringan',
      safeForKids: true
    },
    variants: [
      { size: "Mini (12cm)", price: 29000, shopeePrice: 34900, tokopediaPrice: 29000, lazadaPrice: 29000, tiktokPrice: 31900, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com", lazadaUrl: "https://lazada.co.id", tiktokUrl: "https://tiktok.com" }
    ]
  }
];
