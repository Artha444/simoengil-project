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
import { PRODUCTS, Product } from '@/data/products';
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
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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
    // 1. Wishlist from localStorage
    const savedWishlist = localStorage.getItem('simoengil_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to load wishlist', e);
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
            tokopediaLink: data.tokopedia_link || '',
            lazadaLink: specs.lazadaLink || data.lazadaLink || '',
            tiktokLink: specs.tiktokLink || data.tiktokLink || '',
            shopeePrice: specs.shopeePrice || data.shopeePrice || undefined,
            tokopediaPrice: specs.tokopediaPrice || data.tokopediaPrice || undefined,
            lazadaPrice: specs.lazadaPrice || data.lazadaPrice || undefined,
            tiktokPrice: specs.tiktokPrice || data.tiktokPrice || undefined,
            shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
            tokopediaAvailable: specs.tokopediaAvailable !== undefined ? specs.tokopediaAvailable : true,
            lazadaAvailable: specs.lazadaAvailable !== undefined ? specs.lazadaAvailable : true,
            tiktokAvailable: specs.tiktokAvailable !== undefined ? specs.tiktokAvailable : true,
            images: specs.images || data.images || [],
            specifications: {
              material: specs.material || '100% Premium Dacron & Kain Rasfur',
              size: specs.size || 'Standard',
              washing: specs.washing || 'Bisa dicuci mesin',
              safeForKids: specs.safeForKids !== undefined ? specs.safeForKids : true,
              lazadaLink: specs.lazadaLink || '',
              tiktokLink: specs.tiktokLink || '',
              shopeePrice: specs.shopeePrice || undefined,
              tokopediaPrice: specs.tokopediaPrice || undefined,
              lazadaPrice: specs.lazadaPrice || undefined,
              tiktokPrice: specs.tiktokPrice || undefined,
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              tokopediaAvailable: specs.tokopediaAvailable !== undefined ? specs.tokopediaAvailable : true,
              lazadaAvailable: specs.lazadaAvailable !== undefined ? specs.lazadaAvailable : true,
              tiktokAvailable: specs.tiktokAvailable !== undefined ? specs.tiktokAvailable : true,
              images: specs.images || [],
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
          const localProd = PRODUCTS.find((p) => p.id === id);
          if (localProd) {
            setProduct(localProd);
            setActiveImage(localProd.image);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch product from Supabase, falling back to local list:', err);
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
              tokopediaLink: item.tokopedia_link || '',
              lazadaLink: specs.lazadaLink || item.lazadaLink || '',
              tiktokLink: specs.tiktokLink || item.tiktokLink || '',
              shopeePrice: specs.shopeePrice || item.shopeePrice || undefined,
              tokopediaPrice: specs.tokopediaPrice || item.tokopediaPrice || undefined,
              lazadaPrice: specs.lazadaPrice || item.lazadaPrice || undefined,
              tiktokPrice: specs.tiktokPrice || item.tiktokPrice || undefined,
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              tokopediaAvailable: specs.tokopediaAvailable !== undefined ? specs.tokopediaAvailable : true,
              lazadaAvailable: specs.lazadaAvailable !== undefined ? specs.lazadaAvailable : true,
              tiktokAvailable: specs.tiktokAvailable !== undefined ? specs.tiktokAvailable : true,
              specifications: {
                material: specs.material || '100% Premium Dacron & Kain Rasfur',
                size: specs.size || 'Standard',
                washing: specs.washing || 'Bisa dicuci mesin',
                safeForKids: specs.safeForKids !== undefined ? specs.safeForKids : true,
                lazadaLink: specs.lazadaLink || '',
                tiktokLink: specs.tiktokLink || '',
                shopeePrice: specs.shopeePrice || undefined,
                tokopediaPrice: specs.tokopediaPrice || undefined,
                lazadaPrice: specs.lazadaPrice || undefined,
                tiktokPrice: specs.tiktokPrice || undefined,
                shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
                tokopediaAvailable: specs.tokopediaAvailable !== undefined ? specs.tokopediaAvailable : true,
                lazadaAvailable: specs.lazadaAvailable !== undefined ? specs.lazadaAvailable : true,
                tiktokAvailable: specs.tiktokAvailable !== undefined ? specs.tiktokAvailable : true,
              },
              variants: (item.variants || []).map((v: any) => ({
                ...v,
                shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
                tokopediaAvailable: v.tokopediaAvailable !== undefined ? v.tokopediaAvailable : true,
                lazadaAvailable: v.lazadaAvailable !== undefined ? v.lazadaAvailable : true,
                tiktokAvailable: v.tiktokAvailable !== undefined ? v.tiktokAvailable : true,
              }))
            };
          });
          setAllProducts(mappedData);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local products list:', err);
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
  const hasVariants = !!(product.variants && product.variants.length > 0);
  const selectedVariant = product.variants?.find((v) => v.size === selectedSize) || null;
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const isPurchaseDisabled = hasVariants && !selectedSize;

  const prices: number[] = [product.price];
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.price) {
        prices.push(v.price);
      }
    });
  }
  const validPrices = Array.from(new Set(prices.filter(p => typeof p === 'number' && !isNaN(p))));
  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);

  const isShopeeAvailable = selectedVariant ? (selectedVariant.shopeeAvailable !== false) : (product.shopeeAvailable !== false);
  const isTokopediaAvailable = selectedVariant ? (selectedVariant.tokopediaAvailable !== false) : (product.tokopediaAvailable !== false);
  const isLazadaAvailable = selectedVariant ? (selectedVariant.lazadaAvailable !== false) : (product.lazadaAvailable !== false);
  const isTiktokAvailable = selectedVariant ? (selectedVariant.tiktokAvailable !== false) : (product.tiktokAvailable !== false);

  // Wishlist arrays
  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));
  const isWishlisted = wishlist.includes(product.id);

  // Gallery images list (Main product photo + additional images + fallbacks)
  const baseGallery = [
    product.image,
    ...(product.specifications?.images || product.images || [])
  ].filter(Boolean);
  
  // If there are not enough gallery images, supplement with premium details/lifestyle fallbacks
  const galleryImages = [...baseGallery];
  if (galleryImages.length <= 1) {
    galleryImages.push(
      '/images/plushie_lifestyle_car.png',
      '/images/detail_fabric.png',
      '/images/detail_giftbox.png'
    );
  }

  // Format IDR Price
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getMarketplacePrice = (platform: 'shopee' | 'tokopedia' | 'lazada' | 'tiktok') => {
    let platPrices: number[] = [];
    if (selectedVariant) {
      if (platform === 'shopee' && isShopeeAvailable) platPrices.push(selectedVariant.shopeePrice || selectedVariant.price || product.price);
      else if (platform === 'tokopedia' && isTokopediaAvailable) platPrices.push(selectedVariant.tokopediaPrice || selectedVariant.price || product.price);
      else if (platform === 'lazada' && isLazadaAvailable) platPrices.push(selectedVariant.lazadaPrice || selectedVariant.price || product.price);
      else if (platform === 'tiktok' && isTiktokAvailable) platPrices.push(selectedVariant.tiktokPrice || selectedVariant.price || product.price);
    } else {
      if (platform === 'shopee') {
        if (product.shopeeAvailable !== false) platPrices.push(product.shopeePrice || product.price);
        product.variants?.forEach(v => { if (v.shopeeAvailable !== false) platPrices.push(v.shopeePrice || v.price || product.price); });
      } else if (platform === 'tokopedia') {
        if (product.tokopediaAvailable !== false) platPrices.push(product.tokopediaPrice || product.price);
        product.variants?.forEach(v => { if (v.tokopediaAvailable !== false) platPrices.push(v.tokopediaPrice || v.price || product.price); });
      } else if (platform === 'lazada') {
        if (product.lazadaAvailable !== false) platPrices.push(product.lazadaPrice || product.price);
        product.variants?.forEach(v => { if (v.lazadaAvailable !== false) platPrices.push(v.lazadaPrice || v.price || product.price); });
      } else if (platform === 'tiktok') {
        if (product.tiktokAvailable !== false) platPrices.push(product.tiktokPrice || product.price);
        product.variants?.forEach(v => { if (v.tiktokAvailable !== false) platPrices.push(v.tiktokPrice || v.price || product.price); });
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
    return `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
  };

  // Wishlist toggler
  const handleWishlistToggle = () => {
    let updatedWishlist: string[];
    if (isWishlisted) {
      updatedWishlist = wishlist.filter(item => item !== product.id);
    } else {
      updatedWishlist = [...wishlist, product.id];
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ff8fa3', '#ff4d6d'],
      });
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('simoengil_wishlist', JSON.stringify(updatedWishlist));
  };

  // Remove single item from wishlist drawer
  const handleRemoveWishlistItem = (itemId: string) => {
    const updatedWishlist = wishlist.filter(item => item !== itemId);
    setWishlist(updatedWishlist);
    localStorage.setItem('simoengil_wishlist', JSON.stringify(updatedWishlist));
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
  };

  // Static review data for bottom testimonials
  const reviews = [
    {
      id: 1,
      name: 'Ratih Ningsih',
      rating: 5,
      date: '12 Mei 2026',
      comment: 'Bulunya halus banget rasfur premium, jahitannya sangat rapi dan tebal. Isian dacronnya padat tapi tetap empuk banget dipeluk. Sangat rekomended buat anak-anak!',
      avatar: 'RN',
      verified: true
    },
    {
      id: 2,
      name: 'Budi Santoso',
      rating: 5,
      date: '04 Mei 2026',
      comment: 'Beli untuk kado wisuda pacar, respon admin cepat dan dapet selempang kustom nama wisuda gratis. Packingnya rapi menggunakan box cantik dan pita pink manis.',
      avatar: 'BS',
      verified: true
    },
    {
      id: 3,
      name: 'Siti Rahma',
      rating: 5,
      date: '28 April 2026',
      comment: 'Anak saya senang sekali dengan boneka ini, dipeluk terus setiap tidur. Bulunya tidak mudah rontok jadi aman untuk balita. Kemarin dicuci mesin cuci dan dikeringkan tetap mengembang bagus!',
      avatar: 'SR',
      verified: true
    }
  ];

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

          {/* Minimal Navigation Link - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">Beranda</Link>
            <Link href="/#katalog" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">Katalog</Link>
            <Link href="/#tentang" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">Tentang Kami</Link>
            <Link href="/#bts" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">Behind The Scenes</Link>
            <Link href="/#faq" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">FAQ</Link>
          </nav>

          {/* Right Header WhatsApp CTA */}
          <div className="flex items-center gap-4">
            {/* Wishlist Button in Header */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-[#FFB6C8]/30 text-[#FFB6C8] transition-all flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
              aria-label="Buka Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#0A0F1D] shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* WA Button */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Simoengil,%20saya%20tertarik%20dengan%20boneka%20handmade%20Simoengil!"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] hover:from-[#FFB6C8] hover:to-[#FF8FB1] text-white font-extrabold text-[10px] sm:text-xs md:text-sm rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Hubungi WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Links Row */}
        <div className="md:hidden flex items-center justify-center gap-4 py-2 border-t border-white/5 bg-[#0A0F1D]/85 overflow-x-auto whitespace-nowrap scrollbar-none px-4">
          <Link href="/" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Beranda</Link>
          <Link href="/#katalog" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Katalog</Link>
          <Link href="/#tentang" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Tentang Kami</Link>
          <Link href="/#bts" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Proses</Link>
          <Link href="/#faq" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">FAQ</Link>
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
            <span className="font-heading">Kembali ke Katalog</span>
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
            {/* Wishlist */}
            <button
              onClick={handleWishlistToggle}
              className="p-2.5 rounded-xl bg-white shadow-xs border border-[#FFB6C8]/10 hover:border-[#FFB6C8]/30 text-slate-500 hover:text-[#FF8FB1] transition-all cursor-pointer group hover:scale-105 active:scale-95"
              title="Tambah ke Favorit"
            >
              <Heart className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 ${isWishlisted ? 'fill-[#FF8FB1] stroke-[#FF8FB1]' : 'stroke-slate-500'}`} />
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
              
              <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
                {/* Gallery Thumbnails List (Vertical on Desktop, Horizontal on Mobile) */}
                <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible w-full md:w-20 shrink-0 pb-2 md:pb-0 scrollbar-none">
                  {galleryImages.map((imgSrc, index) => {
                    const isActive = activeImage === imgSrc || (index === 0 && activeImage === '');
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImage(imgSrc)}
                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-[#FFF8F3]/20 border-2 transition-all cursor-pointer hover:border-[#FFB6C8] hover:scale-105 duration-200 shrink-0 ${
                          isActive ? 'border-[#FF8FB1] shadow-md shadow-pink-500/10 scale-95' : 'border-[#FFB6C8]/10'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`Detail View ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Main Image Frame with Zoom Effect & Overlay */}
                <div 
                  className="flex-1 w-full relative aspect-square rounded-[2rem] overflow-hidden bg-[#FFF8F3]/40 border border-[#FFB6C8]/10 flex items-center justify-center p-4 group cursor-zoom-in shadow-sm perspective-1000 transition-transform duration-200 ease-out"
                  style={{ transform: `rotateY(${photoTilt.x}deg) rotateX(${photoTilt.y}deg)` }}
                >
                  <div 
                    className="absolute inset-0 w-full h-full"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      key={activeImage || product.image} // Force re-render on image change for smooth fade
                      src={activeImage || product.image}
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
                {/* Category & Handmade Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FF8FB1] bg-[#FFF5F0] px-4 py-1.5 rounded-full border border-[#FFB6C8]/25 shadow-2xs">
                    {product.category}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#E8B37D] bg-[#FFFBF0] px-4 py-1.5 rounded-full border border-[#E8B37D]/25 shadow-2xs">
                    Handmade
                  </span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FF8FB1] bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full border border-[#FFB6C8]/20 shadow-2xs">
                    Premium Quality
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="gsap-hero-title text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C2C2C] font-heading mb-4 leading-tight tracking-tight">
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
                  <span className="text-xs font-bold text-slate-500">{(product.reviewsCount * 3 + 12)} Terjual</span>
                </div>

                {/* Pricing Box */}
                <div className="my-6 p-5 rounded-[2rem] bg-[#FFF8F3]/60 border border-[#FFB6C8]/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Harga Pilihan Terbaik:
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#FF8FB1] tracking-tight">
                      {selectedSize && selectedVariant?.price 
                        ? formatIDR(selectedVariant.price)
                        : minPrice === maxPrice 
                          ? formatIDR(minPrice)
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

                {/* Size Selection Section */}
                {hasVariants && (
                  <div className="mb-6 space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      Pilih Ukuran Teman Peluk:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.variants?.map((v) => {
                        const isSelected = selectedSize === v.size;
                        return (
                          <button
                            key={v.size}
                            onClick={() => setSelectedSize(v.size)}
                            className={`px-5 py-3 rounded-full text-xs font-bold transition-all border cursor-pointer hover:scale-105 active:scale-95 duration-200 flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#FF8FB1] border-[#FF8FB1] text-white shadow-md shadow-pink-500/25'
                                : 'bg-white border-[#FFB6C8]/25 text-slate-600 hover:border-[#FF8FB1] hover:text-[#FF8FB1]'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                            <span>{v.size}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Emotional short description */}
                <div className="prose prose-sm text-slate-600 leading-relaxed mb-6 font-medium">
                  <p className="italic border-l-4 border-[#FFB6C8]/50 pl-4 py-1 text-slate-500">
                    &quot;Dibuat satu per satu dengan cinta oleh pengrajin lokal kami. Setiap jahitan membawa kehangatan, kelembutan, dan persahabatan yang akan menemani setiap mimpi indahmu.&quot;
                  </p>
                </div>

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

                  {/* 3. Cara Perawatan */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => handleAccordionToggle('perawatan')}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <Droplet className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Cara Perawatan</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'perawatan' ? 'rotate-180 text-[#FF8FB1]' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'perawatan' ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                      <div className="text-xs sm:text-sm text-slate-600 space-y-2 pl-6.5 font-medium">
                        <p className="font-bold text-slate-700">Metode Pencucian: {product.specifications.washing}</p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-500">
                          <li>Masukkan boneka ke dalam laundry bag jaring sebelum masuk mesin cuci.</li>
                          <li>Gunakan sabun detergen cair yang lembut (sabun bayi direkomendasikan).</li>
                          <li>Pilih putaran lembut (delicate/handwash cycle) dan air dingin.</li>
                          <li>Keringkan secara alami dengan diangin-anginkan. Hindari jemur langsung di bawah terik matahari ekstrem agar serat bulu tetap halus.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 4. Kelebihan Boneka Simoengil */}
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
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'kelebihan' ? 'max-h-[32rem] pb-4' : 'max-h-0'}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6.5">
                        <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100/50 flex gap-2">
                          <span className="text-xl">🪡</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#2C2C2C]">Jahitan Super Kuat</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">Metode double stitch pengerjaan manual oleh pengrajin lokal berlisensi.</p>
                          </div>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-2">
                          <span className="text-xl">🛡️</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#2C2C2C]">Hypoallergenic</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">Bulu halus tidak mudah rontok, debu tidak mengendap. Aman bagi alergi.</p>
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex gap-2">
                          <span className="text-xl">🧼</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#2C2C2C]">Washable & Quick-dry</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">Silikon dakron grade A tidak mudah menggumpal meskipun dicuci mesin berkali-kali.</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-2">
                          <span className="text-xl">🇮🇩</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#2C2C2C]">100% Produk Lokal</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">Mendukung peningkatan ekonomi pengrajin boneka lokal Indonesia.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ORDER ACTIONS SECTION */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                
                {/* 1. Hubungi via WhatsApp Button (Paling menonjol) */}
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

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <span className="relative px-4 text-[10px] font-black text-slate-400 bg-white uppercase tracking-widest">
                    Atau Adopsi di Marketplace Resmi
                  </span>
                </div>

                {/* 2. Secondary marketplace buttons side-by-side */}
                <div className="space-y-3">
                  {isPurchaseDisabled && (
                    <div className="text-center text-xs font-bold text-[#E8B37D] bg-[#FFFBF0] border border-[#E8B37D]/25 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 animate-pulse">
                      <span>🌸</span>
                      <span>Pilih Ukuran Terlebih Dahulu untuk Membuka Link Marketplace</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Shopee */}
                    <button
                      disabled={isPurchaseDisabled || !isShopeeAvailable || !(selectedVariant?.shopeeUrl || product.shopeeLink)}
                      onClick={() => {
                        const url = selectedVariant?.shopeeUrl || product.shopeeLink;
                        if (url) handleMarketplaceClick('shopee', url);
                      }}
                      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-4 rounded-2xl transition-all duration-300 ${
                        (isPurchaseDisabled || !isShopeeAvailable || !(selectedVariant?.shopeeUrl || product.shopeeLink))
                          ? 'bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed opacity-50 pointer-events-none'
                          : 'bg-[#ee4d2d] hover:bg-[#e03f20] text-white shadow-md shadow-orange-500/10 hover:shadow-lg hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                        <ShoppingBag className="w-4.5 h-4.5" />
                        <span>Beli di Shopee</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium opacity-90">{getMarketplacePrice('shopee')}</span>
                    </button>

                    {/* Tokopedia */}
                    <button
                      disabled={isPurchaseDisabled || !isTokopediaAvailable || !(selectedVariant?.tokopediaUrl || product.tokopediaLink)}
                      onClick={() => {
                        const url = selectedVariant?.tokopediaUrl || product.tokopediaLink;
                        if (url) handleMarketplaceClick('tokopedia', url);
                      }}
                      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-4 rounded-2xl transition-all duration-300 ${
                        (isPurchaseDisabled || !isTokopediaAvailable || !(selectedVariant?.tokopediaUrl || product.tokopediaLink))
                          ? 'bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed opacity-50 pointer-events-none'
                          : 'bg-[#03ac0e] hover:bg-[#02960c] text-white shadow-md shadow-green-500/10 hover:shadow-lg hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                        <ShoppingBag className="w-4.5 h-4.5" />
                        <span>Beli di Tokopedia</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium opacity-90">{getMarketplacePrice('tokopedia')}</span>
                    </button>

                    {/* Lazada */}
                    <button
                      disabled={isPurchaseDisabled || !isLazadaAvailable || !(selectedVariant?.lazadaUrl || product.lazadaLink)}
                      onClick={() => {
                        const url = selectedVariant?.lazadaUrl || product.lazadaLink;
                        if (url) handleMarketplaceClick('lazada', url);
                      }}
                      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-4 rounded-2xl transition-all duration-300 ${
                        (isPurchaseDisabled || !isLazadaAvailable || !(selectedVariant?.lazadaUrl || product.lazadaLink))
                          ? 'bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed opacity-50 pointer-events-none'
                          : 'bg-[#0f136d] hover:bg-[#0c0f56] text-white shadow-xs hover:shadow-md hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Beli di Lazada</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium opacity-90">{getMarketplacePrice('lazada')}</span>
                    </button>

                    {/* TikTok */}
                    <button
                      disabled={isPurchaseDisabled || !isTiktokAvailable || !(selectedVariant?.tiktokUrl || product.tiktokLink)}
                      onClick={() => {
                        const url = selectedVariant?.tiktokUrl || product.tiktokLink;
                        if (url) handleMarketplaceClick('tiktok', url);
                      }}
                      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-4 rounded-2xl transition-all duration-300 ${
                        (isPurchaseDisabled || !isTiktokAvailable || !(selectedVariant?.tiktokUrl || product.tiktokLink))
                          ? 'bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed opacity-50 pointer-events-none'
                          : 'bg-black hover:bg-[#111] text-white shadow-xs hover:shadow-md hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Beli di TikTok Shop</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium opacity-90">{getMarketplacePrice('tiktok')}</span>
                    </button>
                  </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-[#FFB6C8]/20 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex text-[#E8B37D] gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4.5 h-4.5 fill-current text-[#E8B37D]" />
                    ))}
                  </div>
                  
                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20">
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                      <span>{rev.name}</span>
                      {rev.verified && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400">{rev.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

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

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistProducts}
        onRemoveItem={handleRemoveWishlistItem}
        onDetailClick={handleWishlistDetailClick}
      />
      
    </div>
  );
}
