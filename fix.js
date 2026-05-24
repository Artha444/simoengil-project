const fs = require('fs');
let c = fs.readFileSync('src/data/products.ts', 'utf-8');

c = c.replace(/export interface ProductSpecification \{[\s\S]*?\}\n/g, `export interface ProductSpecification {
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
`);

c = c.replace(/export interface ProductVariant \{[\s\S]*?\}\n/g, `export interface ProductVariant {
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
  image?: string;
}
`);

c = c.replace(/export interface Product \{[\s\S]*?\}\n/g, `export interface Product {
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
`);

fs.writeFileSync('src/data/products.ts', c);

let chk = fs.readFileSync('src/app/checkout/page.tsx', 'utf-8');
chk = chk.replace(/shopeeLink: item\.shopeeLink,/g, 'shopeeLink: item.shopeeLink,\ntokopediaLink: item.tokopediaLink,\nlazadaLink: item.lazadaLink,\ntiktokLink: item.tiktokLink,');
fs.writeFileSync('src/app/checkout/page.tsx', chk);
