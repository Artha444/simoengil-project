export interface ProductType {
  name: string;
  image?: string;
  extraPrice?: number;
}

export interface ProductSize {
  name: string;
  extraPrice?: number;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ProductTestimonial {
  name: string;
  rating: number;
  message: string;
  date?: string;
  avatar?: string;
}

export interface ProductSpecification {
  material: string;
  size: string;
  washing: string;
  safeForKids: boolean;
  shopeePrice?: number;
  shopeeAvailable?: boolean;
  images?: string[];
  features?: ProductFeature[];
  soldCount?: number;
  testimonials?: ProductTestimonial[];
  types?: ProductType[];
  sizes?: ProductSize[];
}

export interface ProductVariant {
  type?: string;
  size: string;
  price?: number;
  shopeePrice?: number;
  shopeeUrl: string;
  shopeeAvailable?: boolean;
  image?: string;
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
  shopeePrice?: number;
  shopeeAvailable?: boolean;
  originalPrice?: number;
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
    shopeePrice: 94000,
    specifications: {
      material: '100% Premium Dacron Silikon Grade A & Bulu Rasfur Halus',
      size: 'Tinggi 35 cm, Lebar 25 cm',
      washing: 'Bisa dicuci dengan mesin (putaran lembut) atau cuci tangan',
      safeForKids: true,
      types: [
        { name: "Cokelat Klasik", extraPrice: 0 }
      ],
      sizes: [
        { name: "Medium (40cm)", extraPrice: 0 },
        { name: "Jumbo (100cm)", extraPrice: 100000 }
      ],
      features: [
        { icon: "🪡", title: "Jahitan Super Kuat", description: "Metode double stitch pengerjaan manual oleh pengrajin lokal berlisensi." },
        { icon: "🛡️", title: "Hypoallergenic", description: "Bulu halus tidak mudah rontok, debu tidak mengendap. Aman bagi alergi." },
        { icon: "🧼", title: "Washable & Quick-dry", description: "Silikon dakron grade A tidak mudah menggumpal meskipun dicuci mesin berkali-kali." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Mendukung peningkatan ekonomi pengrajin boneka lokal Indonesia." }
      ],
      soldCount: 520,
      testimonials: [
        {
          name: 'Ratih Ningsih',
          rating: 5,
          message: 'Bulunya halus banget rasfur premium, jahitannya sangat rapi dan tebal. Isian dacronnya padat tapi tetap empuk banget dipeluk. Sangat rekomended buat anak-anak!',
          date: '12 Mei 2026',
          avatar: 'RN'
        },
        {
          name: 'Budi Santoso',
          rating: 5,
          message: 'Beli untuk kado wisuda pacar, respon admin cepat dan dapet selempang kustom nama wisuda gratis. Packingnya rapi menggunakan box cantik dan pita pink manis.',
          date: '04 Mei 2026',
          avatar: 'BS'
        }
      ]
    },
    variants: []
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
    shopeePrice: 99000,
    specifications: {
      material: '100% Premium Dacron & Kain Velboa Super Lembut',
      size: 'Tinggi 40 cm (ujung telinga ke kaki), Lebar 20 cm',
      washing: 'Cuci tangan dengan air hangat hangat kuku dan sabun bayi',
      safeForKids: true,
      types: [
        { name: "Pink Pastel", extraPrice: 0 }
      ],
      sizes: [
        { name: "Medium (35cm)", extraPrice: 0 },
        { name: "Jumbo (80cm)", extraPrice: 104000 }
      ],
      features: [
        { icon: "🪡", title: "Jahitan Super Kuat", description: "Metode double stitch pengerjaan manual oleh pengrajin lokal berlisensi." },
        { icon: "🛡️", title: "Hypoallergenic", description: "Bulu halus tidak mudah rontok, debu tidak mengendap. Aman bagi alergi." },
        { icon: "🧼", title: "Washable & Quick-dry", description: "Silikon dakron grade A tidak mudah menggumpal meskipun dicuci mesin berkali-kali." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Mendukung peningkatan ekonomi pengrajin boneka lokal Indonesia." }
      ]
    },
    variants: []
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
    shopeePrice: 115000,
    specifications: {
      material: '100% Premium Dacron Grade A & Kain Spandex Lembut elastis',
      size: 'Panjang 38 cm, Tinggi 22 cm',
      washing: 'Cukup diusap dengan kain basah hangat atau cuci tangan lembut',
      safeForKids: true,
      types: [
        { name: "Hijau Cerah", extraPrice: 0 }
      ],
      sizes: [
        { name: "Medium (38cm)", extraPrice: 0 },
        { name: "Jumbo (80cm)", extraPrice: 100000 }
      ],
      features: [
        { icon: "🪡", title: "Jahitan Super Kuat", description: "Metode double stitch pengerjaan manual oleh pengrajin lokal berlisensi." },
        { icon: "🛡️", title: "Hypoallergenic", description: "Bulu halus tidak mudah rontok, debu tidak mengendap. Aman bagi alergi." },
        { icon: "🧼", title: "Washable & Quick-dry", description: "Silikon dakron grade A tidak mudah menggumpal meskipun dicuci mesin berkali-kali." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Mendukung peningkatan ekonomi pengrajin boneka lokal Indonesia." }
      ]
    },
    variants: []
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
    shopeePrice: 84000,
    specifications: {
      material: 'Isian Microfiber Bulu Angsa Sintetis & Kain Spandex Elastis premium',
      size: 'Diameter 30 cm',
      washing: 'Bisa dicuci mesin cuci dengan laundry bag putaran rendah',
      safeForKids: true,
      types: [
        { name: "Putih", extraPrice: 0 }
      ],
      sizes: [
        { name: "Squishy (30cm)", extraPrice: 0 },
        { name: "Super Jumbo (60cm)", extraPrice: 80000 }
      ],
      features: [
        { icon: "🪡", title: "Jahitan Super Kuat", description: "Metode double stitch pengerjaan manual oleh pengrajin lokal berlisensi." },
        { icon: "🛡️", title: "Hypoallergenic", description: "Bulu halus tidak mudah rontok, debu tidak mengendap. Aman bagi alergi." },
        { icon: "🧼", title: "Washable & Quick-dry", description: "Silikon dakron grade A tidak mudah menggumpal meskipun dicuci mesin berkali-kali." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Mendukung peningkatan ekonomi pengrajin boneka lokal Indonesia." }
      ]
    },
    variants: []
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
    shopeePrice: 135000,
    specifications: {
      material: '100% Premium Dacron & Bulu Snail Mawar Bertekstur Indah',
      size: 'Tinggi 35 cm (posisi duduk)',
      washing: 'Dicuci kering (dry clean) disarankan, toga dapat dilepas',
      safeForKids: true,
      types: [
        { name: "Kado Wisuda Biasa", extraPrice: 0 },
        { name: "Kustom Nama (+Selempang)", extraPrice: 15000 }
      ],
      sizes: [
        { name: "Medium (35cm)", extraPrice: 0 },
        { name: "Jumbo (70cm)", extraPrice: 124000 }
      ],
      features: [
        { icon: "🪡", title: "Jahitan Super Kuat", description: "Metode double stitch pengerjaan manual oleh pengrajin lokal berlisensi." },
        { icon: "🛡️", title: "Hypoallergenic", description: "Bulu halus tidak mudah rontok, debu tidak mengendap. Aman bagi alergi." },
        { icon: "🧼", title: "Washable & Quick-dry", description: "Silikon dakron grade A tidak mudah menggumpal meskipun dicuci mesin berkali-kali." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Mendukung peningkatan ekonomi pengrajin boneka lokal Indonesia." }
      ]
    },
    variants: []
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
    shopeePrice: 34900,
    specifications: {
      material: 'Dacron Premium Silikon & Bulu Rasfur Halus',
      size: 'Tinggi 12 cm',
      washing: 'Cuci tangan secara perlahan menggunakan sikat gigi lembut',
      safeForKids: true,
      types: [
        { name: "Cokelat", extraPrice: 0 },
        { name: "Krem", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (12cm)", extraPrice: 0 }
      ]
    },
    variants: []
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
    shopeePrice: 34900,
    specifications: {
      material: 'Dacron Premium Silikon & Bulu Yelvo Halus',
      size: 'Tinggi 12 cm',
      washing: 'Cuci tangan perlahan dengan air sabun ringan',
      safeForKids: true,
      types: [
        { name: "Pink Telinga", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (12cm)", extraPrice: 0 }
      ]
    },
    variants: []
  }
];

export interface CartItem extends Product {
  cartItemId: string;
  selectedVariantType?: string;
  selectedVariantSize?: string;
  quantity: number;
  selectedPrice: number;
}
