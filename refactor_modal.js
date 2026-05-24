const fs = require('fs');
let c = fs.readFileSync('src/components/ProductDetailModal.tsx', 'utf-8');

// Update props interface
c = c.replace(/isWishlisted: boolean;\n\s*onWishlistToggle: \(id: string\) => void;/g, 'onAddToCart: (product: import(\\'@/data/products\\').Product, variantSize?: string) => void;');

// Update destructuring
c = c.replace(/isWishlisted,\n\s*onWishlistToggle,/g, 'onAddToCart,');

// Remove wishlist heart button
c = c.replace(/<button\n\s*onClick=\{handleWishlistClick\}[\s\S]*?<\/button>/g, '');
c = c.replace(/const handleWishlistClick = \(e: React\.MouseEvent\) => \{[\s\S]*?\};\n/g, '');

// Update Tambah ke Keranjang + add Beli Sekarang side by side
c = c.replace(/<button\n\s*onClick=\{handleBuyClick\}\n\s*className=\"flex-1[\s\S]*?Tambah ke Keranjang\n\s*<\/span>\n\s*<\/button>/g, `<div className="flex gap-2 w-full mt-4">
                  <button
                    onClick={() => {
                      onAddToCart(product, selectedSize);
                      onClose();
                    }}
                    className="flex-1 py-3 px-2 bg-[#0F4C5C] hover:bg-[#0B3A46] text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(15,76,92,0.2)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>+ Keranjang</span>
                  </button>
                  <button
                    onClick={handleBuyClick}
                    className="flex-1 py-3 px-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(249,115,22,0.3)] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>`);

fs.writeFileSync('src/components/ProductDetailModal.tsx', c);
