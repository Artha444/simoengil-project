'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageSquare, 
  ShoppingBag, 
  ShoppingCart,
  Star, 
  CheckCircle,
  Sparkles,
  Smile,
  ChevronDown,
  BookOpen,
  Layers,
  Droplet,
  ShieldCheck
} from 'lucide-react';
import { PRODUCTS, Product, type CartItem } from '@/data/products';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { GSAPInitializer } from '@/components/GSAPInitializer';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  // Unwrap Next.js 15 params promise
  const { id } = use(params);
  const router = useRouter();
  
  // States
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Zoom and Accordion States
  const [zoomOrigin, setZoomOrigin] = useState<string>('center');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [photoTilt, setPhotoTilt] = useState({ x: 0, y: 0 });
  const [activeAccordion, setActiveAccordion] = useState<string | null>('deskripsi');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Zoom Origin
    const px = ((e.clientX - left) / width) * 100;
    const py = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${px}% ${py}%`);

    // Tilt (desktop only)
    if (window.innerWidth >= 768) {
      const tx = (e.clientX - left - width / 2) / 20;
      const ty = -(e.clientY - top - height / 2) / 20;
      setPhotoTilt({ x: tx, y: ty });
    }
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomOrigin('center');
    setPhotoTilt({ x: 0, y: 0 });
  };

  const handleAccordionToggle = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // Load product from Supabase & All Products & Check Admin Session & Wishlist
  useEffect(() => {
    // 1. Cart from localStorage
    const savedCart = localStorage.getItem('simoengil_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }

    // 2. Fetch specific product
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const specs = data.specifications || {};
          const mappedProduct: Product = {
            id: String(data.id),
            name: data.name,
            price: Number(data.price),
            category: data.category,
            image: data.image,
            status: data.status,
            description: data.description,
            rating: Number(data.rating || 5.0),
            reviewsCount: Number(data.reviews_count || 0),
            shopeeLink: data.shopee_link || '',
            shopeePrice: specs.shopeePrice || data.shopeePrice || undefined,
            shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
            images: specs.images || data.images || [],
            specifications: {
              material: specs.material || '100% Premium Dacron & Kain Rasfur',
              size: specs.size || 'Standard',
              washing: specs.washing || 'Bisa dicuci mesin',
              safeForKids: specs.safeForKids !== undefined ? specs.safeForKids : true,
              shopeePrice: specs.shopeePrice || undefined,
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              images: specs.images || [],
              features: specs.features || [],
              soldCount: specs.soldCount || 0,
              testimonials: specs.testimonials || [],
              types: specs.types || (data.variants ? Array.from(new Set(data.variants.map((v:any) => v.type).filter(Boolean))).map(t => ({ name: t as string, extraPrice: 0 })) : undefined),
              sizes: specs.sizes || (data.variants ? Array.from(new Set(data.variants.map((v:any) => v.size).filter(Boolean))).map(s => ({ name: s as string, extraPrice: 0 })) : undefined),
            },
            variants: (data.variants || []).map((v: any) => ({
              ...v,
              shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              tokopediaAvailable: v.tokopediaAvailable !== undefined ? v.tokopediaAvailable : true,
              lazadaAvailable: v.lazadaAvailable !== undefined ? v.lazadaAvailable : true,
              tiktokAvailable: v.tiktokAvailable !== undefined ? v.tiktokAvailable : true,
            }))
          };
          setProduct(mappedProduct);
          setActiveImage(mappedProduct.image);
        } else {
          const localMockStr = localStorage.getItem('simoengil_mock_products');
          if (localMockStr) {
            const localMock = JSON.parse(localMockStr);
            const localProd = localMock.find((p: any) => p.id === id);
            if (localProd) {
              setProduct(localProd);
              setActiveImage(localProd.image);
              return;
            }
          }
          const localProd = PRODUCTS.find((p) => p.id === id);
          if (localProd) {
            setProduct(localProd);
            setActiveImage(localProd.image);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch product from Supabase, falling back to local list:', err);
        const localMockStr = localStorage.getItem('simoengil_mock_products');
        if (localMockStr) {
          const localMock = JSON.parse(localMockStr);
          const localProd = localMock.find((p: any) => p.id === id);
          if (localProd) {
            setProduct(localProd);
            setActiveImage(localProd.image);
            return;
          }
        }
        const localProd = PRODUCTS.find((p) => p.id === id);
        if (localProd) {
          setProduct(localProd);
          setActiveImage(localProd.image);
        }
      } finally {
        setLoading(false);
      }
    };

    // 3. Fetch all products (for Wishlist Drawer details)
    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const mappedData = data.map((item: any) => {
            const specs = item.specifications || {};
            return {
              id: String(item.id),
              name: item.name,
              price: Number(item.price),
              category: item.category,
              image: item.image,
              status: item.status,
              description: item.description,
              rating: Number(item.rating || 5.0),
              reviewsCount: Number(item.reviews_count || 0),
              shopeeLink: item.shopee_link || '',
              shopeePrice: specs.shopeePrice || item.shopeePrice || undefined,
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              specifications: {
                material: specs.material || '100% Premium Dacron & Kain Rasfur',
                size: specs.size || 'Standard',
                washing: specs.washing || 'Bisa dicuci mesin',
                safeForKids: specs.safeForKids !== undefined ? specs.safeForKids : true,
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
                images: specs.images || [],
                features: specs.features || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types: specs.types || (item.variants ? Array.from(new Set(item.variants.map((v:any) => v.type).filter(Boolean))).map(t => ({ name: t as string, extraPrice: 0 })) : undefined),
                sizes: specs.sizes || (item.variants ? Array.from(new Set(item.variants.map((v:any) => v.size).filter(Boolean))).map(s => ({ name: s as string, extraPrice: 0 })) : undefined),
              },
              variants: (item.variants || []).map((v: any) => ({
                ...v,
                shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              }))
            };
          });
          setAllProducts(mappedData);
        } else {
          const localMockStr = localStorage.getItem('simoengil_mock_products');
          if (localMockStr) {
            setAllProducts(JSON.parse(localMockStr));
          } else {
            setAllProducts(PRODUCTS);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch all products, using local fallback:', err);
        const localMockStr = localStorage.getItem('simoengil_mock_products');
        if (localMockStr) {
          setAllProducts(JSON.parse(localMockStr));
        } else {
          setAllProducts(PRODUCTS);
        }
      }
    };

    // 4. Check admin session
    const checkAdminSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAdmin(!!session);
      } catch (err) {
        console.warn('Could not retrieve auth session:', err);
      }
    };

    checkAdminSession();
    fetchProduct();
    fetchAllProducts();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FFB6C8]/30 border-t-[#FF8FB1] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Mempersiapkan kelembutan boneka...</p>
        </div>
      </div>
    );
  }

  // Fallback if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-[#FFB6C8]/10 space-y-6">
          <div className="w-24 h-24 rounded-full bg-[#FFF5F0] flex items-center justify-center border border-[#FFB6C8]/25 mx-auto text-3xl animate-float">
            🧸
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2C2C2C] font-heading">Teman Peluk Tidak Ditemukan</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Maaf, boneka yang Anda cari mungkin sudah diadopsi oleh orang lain atau sedang istirahat di gudang kami.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full py-4 bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white rounded-2xl font-extrabold text-sm transition-all shadow-md text-center"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Derived states
  const productTypes = product.specifications?.types || [];
  const productSizes = product.specifications?.sizes || [];
  const uniqueTypes = productTypes.map(t => t.name);
  const uniqueSizes = productSizes.map(s => s.name);

  const hasTypes = uniqueTypes.length > 0;
  const hasSizes = uniqueSizes.length > 0;
  
  const selectedTypeObj = productTypes.find(t => t.name === selectedType);
  const selectedSizeObj = productSizes.find(s => s.name === selectedSize);

  const typeExtraPrice = selectedTypeObj?.extraPrice || 0;
  const sizeExtraPrice = selectedSizeObj?.extraPrice || 0;
  const currentPrice = product.price + typeExtraPrice + sizeExtraPrice;
  
  const isTypeSelected = !hasTypes || selectedType !== null;
  const isSizeSelected = !hasSizes || selectedSize !== null;
  const isPurchaseDisabled = !isTypeSelected || !isSizeSelected;

  const maxTypeExtra = productTypes.length > 0 ? Math.max(...productTypes.map(t => t.extraPrice || 0)) : 0;
  const maxSizeExtra = productSizes.length > 0 ? Math.max(...productSizes.map(s => s.extraPrice || 0)) : 0;
  
  const minPrice = product.price;
  const maxPrice = product.price + maxTypeExtra + maxSizeExtra;

  // Shopee availability logic (simplified for now to product level)
  const isShopeeAvailable = product.specifications?.shopeeAvailable !== false && product.shopeeAvailable !== false;

  // Gallery images list (Main product photo + additional images)
  const galleryImages = [
    product.image,
    ...(product.specifications?.images || product.images || [])
  ].filter(Boolean);

  // Format IDR Price
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const getMarketplacePrice = (platform: 'shopee') => {
    let platPrices: number[] = [];
    if (platform === 'shopee' && isShopeeAvailable) {
        if (product.specifications?.shopeePrice) {
            platPrices.push(product.specifications.shopeePrice);
        } else if (product.shopeePrice) {
            platPrices.push(product.shopeePrice);
        } else {
            platPrices.push(currentPrice);
        }
    }
    const validPlatPrices = Array.from(new Set(platPrices.filter(p => typeof p === 'number' && !isNaN(p))));
    if (validPlatPrices.length === 0) return '';
    const minPlatPrice = Math.min(...validPlatPrices);
    return formatIDR(minPlatPrice);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (productName: string, sizeName: string | null) => {
    const sizeText = sizeName ? ` ukuran ${sizeName}` : '';
    const text = `Halo Min, saya tertarik dengan Boneka ${productName}${sizeText} yang ada di website Simoengil.`;
    return `https://wa.me/6281545585448?text=${encodeURIComponent(text)}`;
  };

  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('simoengil_cart', JSON.stringify(updated));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updated = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(updated);
    localStorage.setItem('simoengil_cart', JSON.stringify(updated));
  };

  const handleAddToCart = () => {
    if (isPurchaseDisabled) return;
    
    // Create cart item
    const cartItemId = `${product.id}-${selectedSize || 'default'}-${Date.now()}`;
    const newItem: CartItem = {
      ...product,
      cartItemId,
      selectedVariantType: selectedType || undefined,
      selectedVariantSize: selectedSize || undefined,
      quantity: 1,
      selectedPrice: currentPrice ?? 0,
    };

    const updated = [...cart, newItem];
    setCart(updated);
    localStorage.setItem('simoengil_cart', JSON.stringify(updated));
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0F4C5C', '#1A7A90'],
    });

    // Buka drawer cart
    setIsWishlistOpen(true);
  };

  const handleBuyNow = () => {
    if (isPurchaseDisabled) return;
    
    // Langsung ke checkout
    let checkoutUrl = `/checkout?product_id=${product.id}`;
    if (selectedType) checkoutUrl += `&type=${selectedType}`;
    if (selectedSize) checkoutUrl += `&variant=${selectedSize}`;
    router.push(checkoutUrl);
  };


  const handleWishlistDetailClick = (p: Product) => {
    setIsWishlistOpen(false);
    router.push(`/product/${p.id}`);
  };

  const handleMarketplaceClick = (platform: 'shopee' | 'tokopedia' | 'lazada' | 'tiktok', url: string) => {
    let colors = ['#ff4d2f', '#ff8e2f', '#fff'];
    if (platform === 'tokopedia') colors = ['#03ac0e', '#3cd070', '#fff'];
    if (platform === 'lazada') colors = ['#0f136d', '#ff007f', '#00d2ff'];
    if (platform === 'tiktok') colors = ['#000000', '#00f2fe', '#fe0979'];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: colors,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };  const testimonials = product.specifications?.testimonials || [];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip selection:bg-pink-100 selection:text-pink-600 bg-transparent font-sans text-[#2C2C2C]">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-white/50 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-pink-100/25 blur-3xl" />
        <div className="absolute bottom-[20%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-orange-100/20 blur-3xl" />
      </div>

      {/* Premium Admin Storefront Bar */}
      {isAdmin && (
        <div className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-pink-500/30 text-white shadow-lg flex items-center transition-all duration-300">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left py-2 px-4">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 animate-pulse text-sm sm:text-lg">✨</span>
              <p className="text-[10px] sm:text-sm font-semibold tracking-wide">
                <span className="hidden sm:inline">Selamat datang, </span><span className="text-pink-300 font-black">Admin Simoengil</span>! <span className="hidden sm:inline">Anda masuk menggunakan akun admin.</span>
              </p>
            </div>
            <Link
              href="/admin-panel/dashboard"
              className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl shadow-md shadow-pink-500/20 hover:shadow-lg transition-all hover:scale-[1.03] cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>🧸 <span className="hidden sm:inline">Kembali ke Dashboard Admin</span><span className="sm:hidden">Ke Admin</span></span>
            </Link>
          </div>
        </div>
      )}

      {/* HEADER / NAVBAR */}
      <header className={`sticky ${isAdmin ? 'top-14' : 'top-0'} z-40 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-[#FFB6C8]/10 shadow-md transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Shop Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center shadow-md shadow-pink-500/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
              <img src="/images/logo.png" alt="Simoengil Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-xl font-bold text-white tracking-wide group-hover:text-[#FFB6C8] transition-colors font-heading block leading-none truncate">
                Simoengil
              </span>
              <span className="text-[8px] sm:text-[10px] text-[#E8B37D] font-extrabold uppercase tracking-widest mt-0.5 sm:mt-1 block truncate">
                Premium Handmade Plushie
              </span>
            </div>
          </Link>
          {/* Right Header WhatsApp CTA */}
          <div className="flex items-center gap-4">
            {/* WA Button */}
            <a
              href="https://wa.me/6281545585448?text=Halo%20Simoengil,%20saya%20tertarik%20dengan%20boneka%20handmade%20Simoengil!"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] hover:from-[#FFB6C8] hover:to-[#FF8FB1] text-white font-extrabold text-[10px] sm:text-xs md:text-sm rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Hubungi WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Cart Button in Header */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-[#FFB6C8]/30 text-[#FFB6C8] transition-all flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
              aria-label="Buka Keranjang"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#0A0F1D] shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/#katalog"
            className="inline-flex items-center gap-2.5 text-sm font-bold text-slate-500 hover:text-[#FF8FB1] transition-colors group"
          >
            <div className="p-2.5 rounded-xl bg-white shadow-xs group-hover:shadow-md border border-[#FFB6C8]/10 group-hover:border-[#FFB6C8]/30 transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-heading">Kembali</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Share */}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Tautan halaman berhasil disalin!');
              }}
              className="p-2.5 rounded-xl bg-white shadow-xs border border-[#FFB6C8]/10 hover:border-[#FFB6C8]/30 text-slate-500 hover:text-[#FF8FB1] transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Salin Tautan"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* GSAP Text Animating Wrapper */}
        <GSAPInitializer />

        {/* TWO-COLUMN PRODUCT DETAILS */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-[#FFB6C8]/10 shadow-[0_20px_50px_-20px_rgba(255,182,200,0.15)] overflow-hidden p-4 sm:p-8 lg:p-12 mb-16 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* LEFT COLUMN: IMAGE GALLERY VIEWER (45% Width) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              
              <div className="relative w-full aspect-[4/5] rounded-none sm:rounded-[2rem] overflow-hidden bg-[#FFF8F3]/40 border border-[#FFB6C8]/10 flex items-center justify-center group shadow-sm">
                <div 
                  className="absolute inset-0 w-full h-full cursor-zoom-in perspective-1000 transition-transform duration-200 ease-out"
                  style={{ transform: `rotateY(${photoTilt.x}deg) rotateX(${photoTilt.y}deg)` }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    key={activeImage || product.image}
                    src={activeImage || product.image}
                    referrerPolicy="no-referrer"
                    alt={product.name}
                    style={{
                      transformOrigin: zoomOrigin,
                      transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out animate-in fade-in"
                  />
                </div>
                {/* Subtle pink gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFB6C8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Thumbnails Overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10 overflow-x-auto scrollbar-none">
                  {galleryImages.map((imgSrc, index) => {
                    const isActive = activeImage === imgSrc || (index === 0 && activeImage === '');
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImage(imgSrc)}
                        className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm border-2 transition-all cursor-pointer hover:border-[#FFB6C8] shrink-0 ${
                          isActive ? 'border-[#FF8FB1] shadow-md scale-100' : 'border-transparent opacity-70 hover:opacity-100 scale-95'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          referrerPolicy="no-referrer"
                          alt={`Detail View ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle Image Description */}
              {galleryImages.includes('/images/plushie_lifestyle_car.png') && (
                <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/30 flex items-start gap-2.5 gsap-reveal" data-effect="fade-slide-right">
                  <span className="text-base mt-0.5">🚗</span>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-[#E8B37D]">Lifestyle Angle:</span> Boneka kami didesain multifungsi. Sangat lucu ditempatkan di dasbor mobil sebagai penghias perjalanan Anda maupun diletakkan di tempat tidur sebagai teman peluk tidur yang nyaman.
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT META & ORDER ACTIONS (55% Width) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Badges Removed per request */}

                {/* Product Name */}
                <h1 className="gsap-hero-title text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C2C2C] mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Sold count */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex text-[#E8B37D] gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4.5 h-4.5 fill-current ${
                          i < Math.floor(product.rating) ? 'text-[#E8B37D]' : 'text-slate-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#2C2C2C]">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviewsCount} Ulasan)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-xs font-bold text-slate-500">{product.specifications?.soldCount || 0} Terjual</span>
                </div>

                {/* Pricing Box */}
                <div className="my-6 p-5 rounded-[2rem] bg-[#FFF8F3]/60 border border-[#FFB6C8]/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Harga Pilihan Terbaik:
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#FF8FB1] tracking-tight">
                      {(selectedType || selectedSize || minPrice === maxPrice)
                        ? formatIDR(currentPrice)
                        : `${formatIDR(minPrice)} - ${formatIDR(maxPrice)}`
                      }
                    </span>
                    {selectedSize && (
                      <span className="text-xs font-bold text-[#FF8FB1] bg-[#FFF5F0] border border-[#FFB6C8]/25 px-3 py-1 rounded-full animate-bounce">
                        Ukuran {selectedSize}
                      </span>
                    )}
                  </div>
                </div>

                {/* Variant Type Selection Section */}
                {hasTypes && (
                  <div className="mb-6 space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      Variasi:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {productTypes.map((typeObj, index) => {
                        const isSelected = selectedType === typeObj.name;
                        return (
                          <button
                            key={`${typeObj.name}-${index}`}
                            onClick={() => {
                              setSelectedType(typeObj.name);
                              if (typeObj.image) {
                                setActiveImage(typeObj.image);
                              } else {
                                setActiveImage(product.image);
                              }
                            }}
                            className={`relative px-4 py-2 rounded text-xs font-bold transition-all border cursor-pointer hover:scale-105 active:scale-95 duration-200 flex items-center gap-2 ${
                              isSelected
                                ? 'bg-white border-orange-500 text-orange-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                            }`}
                          >
                            {typeObj.image && (
                              <img src={typeObj.image} alt={typeObj.name} className="w-6 h-6 object-cover rounded shadow-sm" />
                            )}
                            <div className="flex flex-col items-start">
                              <span>{typeObj.name}</span>
                              {typeObj.extraPrice ? (
                                <span className="text-[9px] text-orange-500/80 font-semibold">(+{formatIDR(typeObj.extraPrice)})</span>
                              ) : null}
                            </div>
                            {isSelected && (
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-[8px] border-transparent border-b-orange-500 border-r-orange-500">
                                <span className="absolute -bottom-1 -right-1 text-white text-[8px] font-black translate-x-[2px] translate-y-[2px]">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {hasSizes && (
                  <div className="mb-6 space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      Ukuran:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {productSizes.map((szObj, index) => {
                        const isSelected = selectedSize === szObj.name;
                        return (
                          <button
                            key={`${szObj.name}-${index}`}
                            onClick={() => setSelectedSize(szObj.name)}
                            className={`relative px-4 py-2 rounded text-xs font-bold transition-all border cursor-pointer hover:scale-105 active:scale-95 duration-200 flex flex-col items-center ${
                              isSelected
                                ? 'bg-white border-orange-500 text-orange-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                            }`}
                          >
                            <span>{szObj.name}</span>
                            {szObj.extraPrice ? (
                              <span className="text-[9px] text-orange-500/80 font-semibold">(+{formatIDR(szObj.extraPrice)})</span>
                            ) : null}
                            {isSelected && (
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-[8px] border-transparent border-b-orange-500 border-r-orange-500">
                                <span className="absolute -bottom-1 -right-1 text-white text-[8px] font-black translate-x-[2px] translate-y-[2px]">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Emotional short description removed per request */}

                {/* Accordion Sections */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  
                  {/* 1. Deskripsi Lengkap */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => handleAccordionToggle('deskripsi')}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Deskripsi Lengkap</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'deskripsi' ? 'rotate-180 text-[#FF8FB1]' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'deskripsi' ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium pl-6.5" dangerouslySetInnerHTML={{ __html: product.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </div>

                  {/* 2. Spesifikasi & Bahan */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => handleAccordionToggle('spesifikasi')}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Spesifikasi & Bahan Premium</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'spesifikasi' ? 'rotate-180 text-[#FF8FB1]' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'spesifikasi' ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                      <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pl-6.5 font-medium">
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-400">Bahan Utama</span>
                          <span className="font-bold text-slate-800">{product.specifications.material}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-400">Dimensi / Ukuran</span>
                          <span className="font-bold text-slate-800">{product.specifications.size}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-400">Isian Boneka</span>
                          <span className="font-bold text-slate-800">100% Silikon Dakron Grade A Murni</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-400">Standar Keamanan</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Aman untuk Balita (Hypoallergenic)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Kelebihan Boneka Simoengil */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => handleAccordionToggle('kelebihan')}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Kelebihan Boneka Simoengil</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'kelebihan' ? 'rotate-180 text-[#FF8FB1]' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'kelebihan' ? 'max-h-[32rem] overflow-y-auto pb-4' : 'max-h-0'}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6.5">
                        {product.specifications.features && product.specifications.features.length > 0 ? (
                          product.specifications.features.map((feat, idx) => {
                            // Rotate colors based on index
                            const colors = [
                              'bg-pink-50/50 border-pink-100/50',
                              'bg-amber-50/50 border-amber-100/50',
                              'bg-emerald-50/50 border-emerald-100/50',
                              'bg-blue-50/50 border-blue-100/50',
                              'bg-purple-50/50 border-purple-100/50'
                            ];
                            const colorClass = colors[idx % colors.length];
                            
                            return (
                              <div key={idx} className={`p-3 rounded-2xl border flex gap-2 ${colorClass}`}>
                                <span className="text-xl shrink-0">{feat.icon}</span>
                                <div>
                                  <h5 className="font-bold text-xs text-[#2C2C2C]">{feat.title}</h5>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{feat.description}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <p className="text-xs text-slate-500 italic">Belum ada informasi kelebihan khusus untuk produk ini.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ORDER ACTIONS SECTION */}
              <div className="space-y-4 pt-6 border-t border-slate-100">

                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleAddToCart}
                    disabled={isPurchaseDisabled}
                    className={`flex-1 py-4 px-2 ${isPurchaseDisabled ? 'bg-slate-300' : 'bg-[#0F4C5C] hover:bg-[#0B3A46] hover:scale-[1.02]'} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer`}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>+ Keranjang</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isPurchaseDisabled}
                    className={`flex-1 py-4 px-2 ${isPurchaseDisabled ? 'bg-slate-300' : 'bg-[#FF8FB1] hover:bg-[#FF7A9F] hover:scale-[1.02]'} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer`}
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>

                <div className="w-full mt-3">
                  <button
                    onClick={() => {
                      const url = product.shopeeLink;
                      if (url) handleMarketplaceClick('shopee', url);
                    }}
                    disabled={isPurchaseDisabled || !isShopeeAvailable || !product.shopeeLink}
                    className={`w-full py-4 px-2 ${(isPurchaseDisabled || !isShopeeAvailable || !product.shopeeLink) ? 'bg-slate-300' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02]'} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer`}
                  >
                    <span>Beli di Shopee</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>


        {/* BOTTOM SECTION: CUSTOMER TESTIMONIAL GRID */}
        <div className="bg-white/60 backdrop-blur-xs rounded-[2.5rem] border border-[#FFB6C8]/10 p-6 sm:p-8 lg:p-12 mb-16 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          
          {/* Header Testimonials */}
          <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
            <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF5F0] border border-[#FFB6C8]/30 text-[#FF8FB1] mb-2 shadow-xs">
              <Smile className="w-5 h-5 text-[#E8B37D]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2C2C2C] font-heading tracking-tight">
              Testimoni Teman Peluk
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
              Lebih dari ribuan boneka telah diadopsi dan menemani tidur nyenyak pemiliknya dengan aman.
            </p>
          </div>

          {/* Testimonials Grid */}
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testi, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-[#FFB6C8]/20 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Rating Stars */}
                    <div className="flex text-[#E8B37D] gap-0.5">
                      {[...Array(testi.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4.5 h-4.5 fill-current text-[#E8B37D]" />
                      ))}
                    </div>
                    
                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium italic">
                      &quot;{testi.message}&quot;
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20">
                      {testi.avatar || testi.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                        <span>{testi.name}</span>
                      </h4>
                      {testi.date && <p className="text-[10px] text-slate-400">{testi.date}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 italic">Belum ada testimoni pelanggan untuk produk ini.</p>
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0A0F1D] text-slate-300 pt-20 pb-10 border-t-[6px] border-[#FF8FB1] relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo & Description */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center shadow-md overflow-hidden">
                <img src="/images/logo.png" alt="Simoengil Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="block text-xl font-bold text-white tracking-wide font-heading leading-none">Simoengil</span>
                <span className="block text-[10px] text-[#E8B37D] font-extrabold uppercase tracking-widest mt-1">
                  Premium Handmade Plushie
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
              Penyedia boneka & plushie premium buatan lokal berkualitas ekspor. Menggunakan bahan 100% silikon dacron murni yang hypoallergenic, aman bagi balita, dan mudah dibersihkan.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#FF8FB1] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95" aria-label="Instagram">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#25D366] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95" aria-label="WhatsApp">
                <MessageSquare className="w-4.5 h-4.5" />
              </a>
              <a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#ee4d2d] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95" aria-label="Shopee">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
                </svg>
              </a>
              <a href="https://tokopedia.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-[#42b549] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95" aria-label="Tokopedia">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Navigasi Toko</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li><Link href="/" className="hover:text-[#FF8FB1] transition-colors">Halaman Utama</Link></li>
              <li><Link href="/#katalog" className="hover:text-[#FF8FB1] transition-colors">Katalog Produk</Link></li>
              <li><Link href="/#tentang" className="hover:text-[#FF8FB1] transition-colors">Cerita Simoengil</Link></li>
              <li><Link href="/#bts" className="hover:text-[#FF8FB1] transition-colors">Behind The Scenes</Link></li>
            </ul>
          </div>

          {/* Contact & Disclaimer */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Hubungi Kami</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li>📍 Jakarta, Indonesia</li>
              <li>✉️ halo@simoengilplushie.com</li>
              <li>💬 WhatsApp: +62 812-3456-7890</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Boneka Simoengil. Seluruh Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1 font-medium">
            Dibuat dengan penuh kehangatan <Heart className="w-3.5 h-3.5 fill-[#FF8FB1] stroke-[#FF8FB1]" /> untuk sahabat kecilmu.
          </p>
        </div>
      </footer>

      {/* CART DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={handleWishlistDetailClick}
      />
      
    </div>
  );
}
