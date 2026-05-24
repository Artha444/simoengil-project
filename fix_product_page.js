const fs = require('fs');
let c = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf-8');

// 1. Remove wishlist toggle and remove item functions
c = c.replace(/[\s]*\/\/ Wishlist toggler[\s\S]*?\/\/ Remove single item from wishlist drawer[\s\S]*?localStorage\.setItem\('simoengil_wishlist', JSON\.stringify\(updatedWishlist\)\);\n  \};\n/g, '');

// 2. Add cart functions
c = c.replace(/  const handleWishlistDetailClick = \(p: Product\) => \{/g,
`  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    let updatedCart = cart.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
  };
  
  const handleAddToCart = () => {
    if (product) {
      const variantSize = selectedSize || (product.variants && product.variants.length > 0 ? product.variants[0].size : undefined);
      const cartItemId = variantSize ? \`\${product.id}-\${variantSize}\` : product.id;
      const existingItem = cart.find(item => item.cartItemId === cartItemId);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = cart.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        let price = product.price;
        if (variantSize && product.variants) {
          const v = product.variants.find(v => v.size === variantSize);
          if (v && v.price) price = v.price;
        }
        updatedCart = [...cart, { ...product, cartItemId, selectedVariantSize: variantSize, quantity: 1, selectedPrice: price }];
      }
      
      setCart(updatedCart);
      localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
      setIsWishlistOpen(true);
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0F4C5C', '#136b81'],
      });
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
  };

  const handleWishlistDetailClick = (p: Product) => {`);

// 3. Remove wishlist arrays
c = c.replace(/[\s]*\/\/ Wishlist arrays[\s\S]*?const isWishlisted = .*?;/g, '');

// 4. Update Header button
c = c.replace(/wishlist\.length/g, 'cart.length');
c = c.replace(/aria-label="Buka Wishlist"/g, 'aria-label="Buka Keranjang"');

// 5. Update Wishlist drawer props
const oldDrawer = /<WishlistDrawer[\s\S]*?\/>/g;
const newDrawer = `<WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={handleWishlistDetailClick}
      />`;
c = c.replace(oldDrawer, newDrawer);

// 6. Fix Order Actions section (Replace everything from {/* ORDER ACTIONS SECTION */} to </div> </div> </div> </div>)
// It's safer to just replace the whole right column buttons part.
// The button "Beli di Shopee" logic and "Beli di Tokopedia" etc.
// The user asked to remove Tokopedia, Lazada, Tiktok, and just keep "Beli Langsung" (which opens Shopee) and "Tambah ke Keranjang"
const actionStart = '              {/* ORDER ACTIONS SECTION */}';
const actionEnd = '            </div>\n          </div>\n        </div>';

const newActions = `              {/* ORDER ACTIONS SECTION */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleAddToCart}
                    disabled={isPurchaseDisabled}
                    className={\`flex-1 py-4 px-2 \${isPurchaseDisabled ? 'bg-slate-300' : 'bg-[#0F4C5C] hover:bg-[#0B3A46] hover:scale-[1.02]'} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer\`}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>+ Keranjang</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = selectedVariant?.shopeeUrl || product.shopeeLink;
                      if (url) handleMarketplaceClick('shopee', url);
                    }}
                    disabled={isPurchaseDisabled || !isShopeeAvailable || !(selectedVariant?.shopeeUrl || product.shopeeLink)}
                    className={\`flex-1 py-4 px-2 \${(isPurchaseDisabled || !isShopeeAvailable || !(selectedVariant?.shopeeUrl || product.shopeeLink)) ? 'bg-slate-300' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02]'} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer\`}
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>
                
                {/* 1. Hubungi via WhatsApp Button */}
                <a
                  href={getWhatsAppLink(product.name, selectedSize)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsappSent(true)}
                  className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-black text-base transition-all shadow-[0_8px_25px_-5px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_30px_-5px_rgba(37,211,102,0.5)] hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 cursor-pointer text-center duration-250 hover:animate-wiggle"
                >
                  <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.01 14.137.985 11.998.985 6.559.985 2.137 5.357 2.133 10.789c-.001 1.666.443 3.291 1.285 4.743L2.43 19.982l4.217-1.108zm12.513-6.812c-.332-.165-1.962-.968-2.266-1.077-.303-.11-.525-.165-.745.165-.22.33-.85.744-1.04.96-.19.217-.381.244-.713.079-.332-.165-1.401-.515-2.668-1.644-.986-.88-1.652-1.968-1.846-2.298-.19-.33-.02-.508.145-.672.148-.148.332-.386.498-.578.166-.193.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.165-.745-1.79-.988-2.38-.243-.59-.49-.51-.672-.519-.172-.008-.37-.01-.568-.01-.199 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.962-.801 2.24-1.575.276-.774.276-1.439.194-1.575-.083-.137-.303-.22-.635-.386z" />
                  </svg>
                  <span>Hubungi Admin via WhatsApp</span>
                </a>
                
                {whatsappSent && (
                  <p className="text-center text-[10px] text-emerald-600 font-bold bg-emerald-50 py-2 rounded-xl border border-emerald-100 animate-fadeIn">
                    ✓ Membuka WhatsApp chat... Hubungi admin untuk custom order, pita nama, atau kado spesial!
                  </p>
                )}

              </div>
            </div>
          </div>
        </div>`;

const s = c.indexOf(actionStart);
const e = c.indexOf(actionEnd, s);
if (s !== -1 && e !== -1) {
  c = c.substring(0, s) + newActions + c.substring(e + actionEnd.length);
}

// 7. Remove wishlist toggle button in Breadcrumb section
c = c.replace(/            \{\/\* Wishlist \*\/\}\n            <button\n              onClick=\{handleWishlistToggle\}\n              className="p-2\.5 rounded-xl bg-white shadow-xs border border-\[#FFB6C8\]\/10 hover:border-\[#FFB6C8\]\/30 text-slate-500 hover:text-\[#FF8FB1\] transition-all cursor-pointer group hover:scale-105 active:scale-95"\n              title="Tambah ke Favorit"\n            >\n              <Heart className=\{.*?\} \/>\n            <\/button>\n/s, '');


fs.writeFileSync('src/app/product/[id]/page.tsx', c);
