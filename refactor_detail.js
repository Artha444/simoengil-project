const fs = require('fs');

let page = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf-8');

// State changes
page = page.replace(
  /const \[wishlist, setWishlist\] = useState<string\[\]>\(\[\]\);/g,
  "const [cart, setCart] = useState<import('@/data/products').CartItem[]>([]);"
);

// Load state
page = page.replace(
  /const savedWishlist = localStorage\.getItem\('simoengil_wishlist'\);[\s\S]*?console\.error\('Failed to load wishlist', e\);\s*\}\s*\}/g,
  `const savedCart = localStorage.getItem('simoengil_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }`
);

// Toggle/Add/Remove functions
page = page.replace(
  /\/\/ Sync wishlist to localStorage[\s\S]*?localStorage\.setItem\('simoengil_wishlist', JSON\.stringify\(updatedWishlist\)\);\s*\};/g,
  `// Sync cart to localStorage
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
  
  const handleAddToCart = (product: Product, variantSize?: string) => {
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
    setIsWishlistOpen(true); // Open cart drawer on add
  };

  // Remove single item from cart drawer
  const handleRemoveCartItem = (cartItemId: string) => {
    const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
  };`
);

// Remove wishlistProducts logic
page = page.replace(
  /\/\/ Get wishlisted product details\n\s*const wishlistProducts = allProducts\.filter\(p => wishlist\.includes\(p\.id\)\);\n/g,
  ''
);

page = page.replace(
  /const isWishlisted = wishlist\.includes\(product\.id\);\n/g,
  ''
);


// Header wishlist badge
page = page.replace(
  /\{wishlist\.length > 0 && \([\s\S]*?\{wishlist\.length\}[\s\S]*?<\/span>\n\s*\)\}/g,
  `{cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}`
);

// Wishlist heart overlay button
page = page.replace(
  /<button\n\s*onClick=\{handleWishlistToggle\}\n\s*className=\"absolute top-6 left-6.*?>[\s\S]*?<\/button>/g,
  ''
);

// Beli Sekarang Button
// Wait, currently in product detail it says:
// <button
// onClick={() => { ... }}
// className="flex-1 py-3.5 px-4 bg-[#0F4C5C] ...
// <span>Tambah ke Keranjang</span>
// </button>

// I will just use regex to replace it
page = page.replace(/<button\s*onClick=\{[\s\S]*?Tambah ke Keranjang[\s\S]*?<\/button>/g, `<div className="flex gap-2 w-full mt-4">
                  <button
                    onClick={() => {
                      if (product) handleAddToCart(product, selectedSize);
                    }}
                    className="flex-1 py-4 px-2 bg-[#0F4C5C] hover:bg-[#0B3A46] text-white rounded-2xl text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(15,76,92,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>+ Keranjang</span>
                  </button>
                  <button
                    onClick={() => {
                       let url = product?.shopeeLink || 'https://shopee.co.id';
                       if (selectedSize && product?.variants) {
                         const v = product.variants.find(v => v.size === selectedSize);
                         if (v && v.shopeeUrl) url = v.shopeeUrl;
                       }
                       window.open(url, '_blank');
                    }}
                    className="flex-1 py-4 px-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>`);

// Drawer props
page = page.replace(
  /wishlistItems=\{wishlistProducts\}\n\s*onRemoveItem=\{handleRemoveWishlistItem\}/g,
  `cartItems={cart}\n        onRemoveItem={handleRemoveCartItem}\n        onUpdateQuantity={handleUpdateCartQuantity}`
);

fs.writeFileSync('src/app/product/[id]/page.tsx', page);
