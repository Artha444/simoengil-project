const fs = require('fs');

// 1. Fix ProductCard.tsx
let card = fs.readFileSync('src/components/ProductCard.tsx', 'utf-8');
card = card.replace(/onWishlistToggle: \(id: string\) => void;/g, '');
card = card.replace(/onWishlistToggle,\n/g, '');
card = card.replace(/isWishlisted/g, 'cartItemCount');
card = card.replace(/isWishlisted: boolean;/g, 'cartItemCount: number;');
card = card.replace(/const handleWishlistClick = \(e: React\.MouseEvent\) => {[\s\S]*?};\n/g, 'const handleCartClick = (e: React.MouseEvent) => { e.stopPropagation(); onDetailClick(product); };\n');
card = card.replace(/onClick=\{handleWishlistClick\}/g, 'onClick={handleCartClick}');
card = card.replace(/aria-label=\{cartItemCount \? 'Hapus dari Keranjang' : 'Tambah ke Keranjang'\}/g, 'aria-label="Pilih Variasi"');
card = card.replace(/cartItemCount \? 'fill-\[#0F4C5C\] stroke-\[#0F4C5C\] animate-heart-burst' : 'stroke-slate-400 group-hover\/cart:stroke-\[#0F4C5C\]'/g, 'cartItemCount > 0 ? \\'fill-[#0F4C5C] stroke-[#0F4C5C] animate-heart-burst\\' : \\'stroke-slate-400 group-hover/cart:stroke-[#0F4C5C]\\\'');
card = card.replace(/<span className=\"absolute top-0 right-0.*?>.*?<\/span>/g, ''); // Remove old badge if any
// Add cart item count badge to icon
card = card.replace(/<ShoppingCart\s+className={`w-4\.5 h-4\.5 transition-all duration-300 \${[\s\S]*?}`}\s+\/>/g, 
`<div className="relative">
          <ShoppingCart
            className={\`w-4.5 h-4.5 transition-all duration-300 \${
              cartItemCount > 0 ? 'fill-[#0F4C5C] stroke-[#0F4C5C] animate-heart-burst' : 'stroke-slate-400 group-hover/cart:stroke-[#0F4C5C]'
            }\`}
          />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-pink-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white">
              {cartItemCount}
            </span>
          )}
        </div>`);
fs.writeFileSync('src/components/ProductCard.tsx', card);
