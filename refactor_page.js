const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

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
  /\/\/ Get wishlisted product details\n\s*const wishlistProducts = productsList\.filter\(product => wishlist\.includes\(product\.id\)\);\n/g,
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

// Product card props
page = page.replace(
  /isWishlisted=\{wishlist\.includes\(product\.id\)\}\n\s*onWishlistToggle=\{handleWishlistToggle\}/g,
  `cartItemCount={cart.filter(item => item.id === String(product.id)).reduce((acc, item) => acc + item.quantity, 0)}`
);

// Detail modal props
page = page.replace(
  /isWishlisted=\{selectedProduct \? wishlist\.includes\(selectedProduct\.id\) : false\}\n\s*onWishlistToggle=\{handleWishlistToggle\}/g,
  `onAddToCart={handleAddToCart}`
);

// Drawer props
page = page.replace(
  /wishlistItems=\{wishlistProducts\}\n\s*onRemoveItem=\{handleRemoveWishlistItem\}/g,
  `cartItems={cart}\n        onRemoveItem={handleRemoveCartItem}\n        onUpdateQuantity={handleUpdateCartQuantity}`
);

fs.writeFileSync('src/app/page.tsx', page);
