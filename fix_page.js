const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. State
c = c.replace(/const \[wishlist, setWishlist\] = useState<string\[\]>\(\[\]\);/g, "const [cart, setCart] = useState<import('@/data/products').CartItem[]>([]);");

// 2. useEffect load
c = c.replace(/const savedWishlist = localStorage.getItem\('simoengil_wishlist'\);\n    if \(savedWishlist\) \{\n      try \{\n        setWishlist\(JSON\.parse\(savedWishlist\)\);\n      \} catch \(e\) \{\n        console\.error\('Failed to load wishlist', e\);\n      \}\n    \}/g, 
`const savedCart = localStorage.getItem('simoengil_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }`);

// 3. handleAddToCart, etc
c = c.replace(/  \/\/ Remove single item from wishlist drawer[\s\S]*?localStorage\.setItem\('simoengil_wishlist', JSON\.stringify\(updatedWishlist\)\);\n  \};\n/g, 
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
    setIsWishlistOpen(true);
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
  };
`);

// 4. toggleWishlist
c = c.replace(/  \/\/ Toggle wishlist item\n  const handleWishlistToggle = \(id: string\) => \{[\s\S]*?\};\n/g, '');

// 5. ProductDetailModal props
c = c.replace(/<ProductDetailModal\n\s*product=\{selectedProduct\}\n\s*isOpen=\{isDetailOpen\}\n\s*onClose=\{.*?\}\n\s*isWishlisted=\{.*?\}\n\s*onWishlistToggle=\{.*?\}\n\s*\/>/g, 
`<ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
      />`);

fs.writeFileSync('src/app/page.tsx', c);
