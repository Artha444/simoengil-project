'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Search, 
  Sparkles, 
  Smile, 
  ShieldCheck, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare, 
  ShoppingBag, ShoppingCart, 
  ChevronDown,
  Gift,
  HeartHandshake,
  Star
} from 'lucide-react';
import { Product, ProductVariant, PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { GSAPInitializer } from '@/components/GSAPInitializer';
import { ChatWidget } from '@/components/ChatWidget';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} />;
};

interface WhyFeature {
  icon: string;
  title: string;
  desc: string;
}

interface SiteSettings {
  heroTitle: string;
  heroDescription: string;
  whyTitle: string;
  whyFeatures: WhyFeature[];
  heroImage1: string;
  heroImage2: string;
  heroBadge1Icon: string;
  heroBadge1Text: string;
  heroBadge2Icon: string;
  heroBadge2Text: string;
  logoTextMain: string;
  logoTextSub: string;
  logoIcon: string;
  logoImageType: 'icon' | 'image';
  logoImageUrl: string;
  [key: string]: unknown;
}

export default function Home() {
  // State
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<import('@/data/products').CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('terbaru');
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only tilt on desktop
    if (window.innerWidth < 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = -(e.clientY - top - height / 2) / 20;
    setHeroTilt({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0 });
  };

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTitle: 'Temukan Teman Peluk Pertamamu!',
    heroDescription: 'Toko online Boneka Simoengil menyediakan aneka plushie & boneka super lembut berkualitas tinggi. Terbuat dari 100% premium dacron grade A, hypoallergenic, aman untuk anak-anak, dan bisa dicuci sesering mungkin tanpa khawatir kempis!',
    whyTitle: 'Kenapa Memilih Boneka Simoengil?',
    whyFeatures: [
      { icon: 'ShieldCheck', title: '100% Dacron Grade A', desc: 'Isian silikon dacron super murni tanpa campuran limbah garmen. Memastikan keempukan tahan bertahun-tahun dan tidak gampang kempes.' },
      { icon: 'RefreshCw', title: 'Bisa Dicuci (Washable)', desc: 'Mudah dibersihkan! Cukup dicuci dengan tangan atau mesin cuci (putaran halus). Dacron akan mengembang kembali begitu kering sempurna.' },
      { icon: 'Smile', title: 'Aman untuk Bayi', desc: 'Kain luar bulu yelvo/spandex hypoallergenic berbulu lembut dan tidak mudah rontok. Lulus uji kualitas aman bagi pernapasan balita.' }
    ],
    heroImage1: '/images/plushie_teddy.png',
    heroImage2: '/images/plushie_bunny.png',
    heroBadge1Icon: '🌟',
    heroBadge1Text: 'Terlembut',
    heroBadge2Icon: '❤️',
    heroBadge2Text: 'Anti Alergi',
    logoTextMain: 'Simoengil',
    logoTextSub: 'Plushie & Doll',
    logoIcon: 'Smile',
    logoImageType: 'icon', // 'icon' or 'image'
    logoImageUrl: ''
  });

  // Load wishlist from localStorage on mount & Fetch Supabase products & Check Admin Auth
  useEffect(() => {
    const savedCart = localStorage.getItem('simoengil_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }

    const fetchProducts = async () => {
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
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
                features: specs.features || [],
                images: specs.images || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types: specs.types || [],
                sizes: specs.sizes || [],
              },
              variants: (item.variants || []).map((v: Partial<ProductVariant>) => ({
                ...v,
                shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              }))
            };
          });
          setProductsList(mappedData);
        } else {
          const localMockStr = localStorage.getItem('simoengil_mock_products');
          if (localMockStr) {
            setProductsList(JSON.parse(localMockStr));
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local products list:', err);
        const localMockStr = localStorage.getItem('simoengil_mock_products');
        if (localMockStr) {
          setProductsList(JSON.parse(localMockStr));
        }
      }
    };

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          // Only redirect to admin panel if the email matches an admin email or a specific logic
          if (session.user.email === 'admin@simoengil.com') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.warn('Auth check skipped');
      }
    };
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        if (session.user.email === 'admin@simoengil.com') {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'homepage').single();
        if (!error && data) {
          setSiteSettings(prev => ({
            ...prev,
            ...(data.settings || {})
          }));
        }
      } catch (err) {
        // Silently catch error, we will fallback to localStorage below
        console.log('Using local settings fallback');
      }

      // Always load local defaults if available as fallback or overlay
      const local = localStorage.getItem('simoengil_settings');
      if (local) {
        try {
          const settings = JSON.parse(local);
          setSiteSettings(prev => ({
            ...prev,
            ...settings
          }));
        } catch (e) {
          console.warn('Failed to parse local settings', e);
        }
      }
    };

    fetchProducts();
    fetchSettings();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync cart to localStorage
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
  
  const handleAddToCart = (product: Product, variantSize?: string, variantType?: string) => {
    const cartItemId = `${product.id}-${variantSize || 'default'}-${variantType || 'default'}`;
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
      const sizes = product.specifications?.sizes || [];
      const types = product.specifications?.types || [];
      
      const sizeObj = sizes.find(s => s.name === variantSize);
      const typeObj = types.find(t => t.name === variantType);
      
      if (sizeObj && sizeObj.extraPrice) price += sizeObj.extraPrice;
      if (typeObj && typeObj.extraPrice) price += typeObj.extraPrice;
      
      updatedCart = [...cart, { ...product, cartItemId, selectedVariantSize: variantSize, selectedVariantType: variantType, quantity: 1, selectedPrice: price }];
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

  // Filter products using dynamic productsList
  const filteredProducts = productsList.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'termurah') return a.price - b.price;
    if (sortBy === 'termahal') return b.price - a.price;
    return 0; // 'terbaru' uses default order
  });



  // Open product detail
  const handleProductDetailClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  // Toggle FAQ accordion
  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const handleHeroCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById('katalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Categories list
  const categories = ['Semua', ...Array.from(new Set(productsList.map(p => p.category).filter(Boolean)))];

  // FAQs
  const faqs = [
    {
      q: 'Apakah semua boneka di Boneka Simoengil aman untuk bayi?',
      a: 'Sangat aman! Seluruh produk kami menggunakan isian 100% premium silikon dacron Grade A yang bebas debu dan bersifat hypoallergenic. Bahan luar menggunakan kain rajut bulu ultra lembut (seperti yelvo, spandex, snail mawar) yang tidak mudah rontok, aman dihirup bayi, serta tidak menyebabkan gatal pada kulit sensitif.'
    },
    {
      q: 'Bagaimana cara mencuci boneka agar tidak kempis?',
      a: 'Sangat mudah! Kamu bisa mencucinya dengan tangan (kucek perlahan dengan air hangat kuku dan sabun bayi) atau menggunakan mesin cuci. Untuk pencucian mesin cuci, masukkan boneka ke dalam laundry bag, pilih mode putaran paling lembut (delicate/wool), keringkan dengan pengering mesin cuci, lalu jemur di tempat teduh berangin. Setelah kering, tepuk-tepuk boneka perlahan agar dacron mengembang sempurna seperti baru!'
    },
    {
      q: 'Apakah bisa memesan kado wisuda custom kartu ucapan?',
      a: 'Bisa banget! Untuk pembelian seri Kado Wisuda, kami memberikan GRATIS selempang nama kelulusan mini dan kartu ucapan kustom. Silakan tulis nama wisudawan dan isi pesan ucapan pada catatan pesanan saat melakukan pembelian di Shopee atau Tokopedia.'
    },
    {
      q: 'Berapa lama waktu pengemasan dan pengiriman?',
      a: 'Kami mengirim setiap hari! Untuk pesanan reguler yang masuk sebelum pukul 15.00 WIB, paket akan dikirim di hari yang sama. Untuk wilayah Jabodetabek, pengiriman instan/sameday juga tersedia via marketplace Shopee dan Tokopedia.'
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip selection:bg-pink-100 selection:text-pink-600 bg-transparent font-sans text-slate-800">
      <GSAPInitializer />
      
      {/* Dynamic Floating Background Elements (Illustrations) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[35vw] h-[35vw] rounded-full bg-pink-200/20 blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-orange-100/20 blur-3xl" />
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
    
    {/* Logo & Shop Name (Pojok Kiri) */}
    <a href="#" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
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
    </a>

    {/* Minimal Navigation Link - Desktop */}
    <nav className="hidden md:flex items-center gap-8">
      <a href="#" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">Beranda</a>
      <a href="#katalog" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">Katalog</a>
      <a href="#faq" className="text-sm font-bold text-white/95 hover:text-[#FFB6C8] transition-colors nav-link-underline">FAQ</a>
    </nav>

    {/* Right Header CTA */}
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Track Order Button */}
      <button
        onClick={() => setIsTrackingOpen(true)}
        className="text-xs font-bold text-[#FFB6C8] hover:text-white border border-[#FFB6C8]/30 hover:bg-[#FFB6C8]/20 px-3 py-2 rounded-xl transition-all hidden md:flex items-center gap-1.5 cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" />
        Lacak
      </button>

      {/* Wishlist Button in Header */}
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

      {/* User Auth / Dashboard Button (Pojok Kanan) */}
      {user ? (
        <div className="hidden md:flex items-center ml-2 sm:ml-4">
          <Link href="/dashboard" className="text-xs font-bold text-white hover:text-[#FFB6C8] transition-colors border border-white/10 hover:border-[#FFB6C8]/30 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <LucideIcons.User className="w-3.5 h-3.5" />
            Dashboard Saya
          </Link>
        </div>
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-xs font-bold text-white hover:text-[#FFB6C8] border border-transparent hover:border-[#FFB6C8]/30 px-3 py-2 rounded-xl transition-all hidden md:flex items-center gap-1.5 cursor-pointer ml-2 sm:ml-4"
        >
          <LucideIcons.User className="w-3.5 h-3.5" />
          Daftar / Masuk
        </button>
      )}
    </div>

    {/* Mobile Navigation Links Row */}
    <div className="md:hidden flex items-center justify-center gap-4 py-2 border-t border-white/5 bg-[#0A0F1D]/85 overflow-x-auto whitespace-nowrap scrollbar-none px-4">
      <a href="#" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Beranda</a>
      <a href="#katalog" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Katalog</a>
      <a href="#tentang" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Tentang Kami</a>
      <a href="#bts" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">Proses</a>
      <a href="#faq" className="text-xs font-bold text-white/80 hover:text-[#FFB6C8] px-2 py-1 transition-colors">FAQ</a>
      <button onClick={() => setIsTrackingOpen(true)} className="text-xs font-bold text-[#FFB6C8] hover:text-white px-2 py-1 transition-colors">Lacak</button>
      {!user ? (
        <button onClick={() => setIsAuthModalOpen(true)} className="text-xs font-bold text-[#FFB6C8] hover:text-white px-2 py-1 transition-colors">Masuk/Daftar</button>
      ) : (
        <Link href="/dashboard" className="text-xs font-bold text-[#FFB6C8] hover:text-white px-2 py-1 transition-colors">Dashboard</Link>
      )}
    </div>
  </div>
</header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-8 pb-16 md:pt-12 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16 lg:gap-24 animate-in fade-in duration-700">
        {/* Hero Info */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-[#FFB6C8]/30 text-[#FF8FB1] font-bold text-xs uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B37D]" />
            <span>Premium Local Handmade Brand</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C2C2C] tracking-tight leading-[1.15] font-heading gsap-hero-title">
            Dibuat dengan Hati, <br/>
            <span className="text-[#FF8FB1]">Menemani Setiap</span> Pelukan
          </h1>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium gsap-hero-subtitle">
            Boneka plushie premium buatan lokal dengan kualitas ekspor. Setiap karakter dirancang unik, dijahit tangan secara presisi, menggunakan bahan 100% murni hypoallergenic yang aman untuk buah hati Anda.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-md mx-auto lg:mx-0 text-left pt-2 gsap-stagger-grid">
            <div className="flex items-center gap-2.5 text-[11px] sm:text-sm font-bold text-[#2C2C2C]">
              <span className="text-base sm:text-lg">🌸</span>
              <span>Kain Impor Hypoallergenic</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] sm:text-sm font-bold text-[#2C2C2C]">
              <span className="text-base sm:text-lg">🧸</span>
              <span>100% Dacron Grade A</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] sm:text-sm font-bold text-[#2C2C2C]">
              <span className="text-base sm:text-lg">✨</span>
              <span>Detail Handmade Rapi</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] sm:text-sm font-bold text-[#2C2C2C]">
              <span className="text-base sm:text-lg">❤️</span>
              <span>Parfum Bayi Menenangkan</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 gsap-hero-ctas">
            <a
              href="#katalog"
              onClick={handleHeroCtaClick}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white font-extrabold rounded-2xl text-center shadow-lg shadow-[#FF8FB1]/20 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer btn-premium-hover"
            >
              Adopsi Boneka Gemoy
            </a>

            <a
              href="#tentang"
              className="w-full sm:w-auto px-8 py-4 border-2 border-[#FFB6C8]/40 text-[#2C2C2C] hover:text-[#FF8FB1] hover:border-[#FF8FB1] font-bold rounded-2xl hover:bg-white/40 transition-all duration-300 text-center cursor-pointer btn-premium-hover"
            >
              Kenali Kami
            </a>
          </div>
        </div>

        {/* Hero Interactive Showcase Images (Zielabs Hybrid Style) */}
        <div 
          className="w-full lg:w-1/2 flex items-center justify-center relative px-6 md:px-12 mt-8 lg:mt-0 perspective-1000"
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          <div 
            className="relative w-full max-w-[480px] aspect-square flex items-center justify-center transition-transform duration-200 ease-out"
            style={{ transform: `rotateY(${heroTilt.x}deg) rotateX(${heroTilt.y}deg)` }}
          >
            {/* Glowing Pink and Gold Circles Background */}
            <div className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-[#FFF5F0] via-[#FFF0F3] to-[#FFFDF0] shadow-[0_20px_60px_-15px_rgba(255,182,200,0.45)] border-4 border-white z-0 animate-pulse-glow" />
            <div className="absolute w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-[#FFB6C8]/20 to-[#E8B37D]/20 blur-xl z-0 animate-pulse-glow" style={{ animationDelay: '1s' }} />
            
            {/* Main Teddy Plushie */}
            <img
              src="/images/plushie_teddy.png"
              alt="Main Plushie Bear"
              className="w-[82%] h-[82%] object-contain drop-shadow-[0_25px_35px_rgba(255,143,177,0.25)] animate-float relative z-10"
            />
            
            {/* Floating Badge Left */}
            <div className="absolute top-8 -left-2 bg-white/95 backdrop-blur-md border border-[#FFB6C8]/30 text-[#2C2C2C] text-xs font-bold py-2.5 px-4 rounded-2xl shadow-md rotate-3 flex items-center gap-2 z-20 hover:scale-105 transition-transform duration-300">
              <span className="text-yellow-400 text-base">🌟</span>
              <span>100% Handmade Lokal</span>
            </div>

            {/* Floating Badge Right */}
            <div className="absolute bottom-20 -right-4 bg-white/95 backdrop-blur-md border border-[#E8B37D]/40 text-[#2C2C2C] text-xs font-bold py-2.5 px-4 rounded-2xl shadow-md -rotate-3 flex items-center gap-2.5 z-20 hover:scale-105 transition-transform duration-300">
              <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-[#FF8FB1] text-xs font-black">
                ❤️
              </div>
              <span>Aman & Anti-Alergi</span>
            </div>

            {/* Secondary smaller floating plushie (Bunny) */}
            <div className="absolute bottom-0 left-0 w-36 h-36 flex items-center justify-center animate-float-slow z-20 drop-shadow-lg">
              <img
                src="/images/plushie_bunny.png"
                alt="Mini Bunny Plushie"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES BAR */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white flex flex-wrap md:flex-nowrap items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/20">
              <LucideIcons.Cloud className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#2C2C2C] text-xs uppercase tracking-wider">100% Dacron Premium</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-pink-100/30" />
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-center">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/20">
              <LucideIcons.ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#2C2C2C] text-xs uppercase tracking-wider">Hypoallergenic & SNI</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-pink-100/30" />
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-center">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/20">
              <LucideIcons.Droplets className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#2C2C2C] text-xs uppercase tracking-wider">Bisa Dicuci Mesin</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-pink-100/30" />
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/20">
              <LucideIcons.Truck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#2C2C2C] text-xs uppercase tracking-wider">Pengiriman Cepat</span>
          </div>
        </div>
      </div>

      {/* SECTION A: TENTANG SIMOENGIL (STORYTELLING) */}
      <section id="tentang" className="relative z-10 py-20 bg-gradient-to-b from-transparent via-[#FFF5F0]/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Story Image Section with Polaroid Vibe */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#E8B37D]/20 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#FFB6C8]/20 rounded-full blur-2xl" />
              
              <div className="relative bg-white p-4 pb-12 rounded-[2rem] shadow-xl border border-pink-100/30 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 max-w-[380px] w-full z-10">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src="/images/detail_fabric.png" 
                    alt="Bahan Premium Kain Simoengil" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  <div className="absolute top-4 left-4 bg-[#0A0F1D]/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-widest font-black py-1 px-3 rounded-full">
                    Premium Quality
                  </div>
                </div>
                <div className="mt-5 text-center font-heading font-black text-[#2C2C2C] text-sm tracking-wide">
                  ✨ Kain Lembut & Dacron Murni
                </div>
              </div>
            </div>

            {/* Story Text Section */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#E8B37D]/30 text-[#E8B37D] font-bold text-xs uppercase tracking-widest">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Our Storytelling</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C2C2C] tracking-tight leading-tight font-heading gsap-section-title relative inline-block pb-3">
                Cerita Kehangatan di Balik Setiap Boneka Simoengil
                <span className="gsap-underline absolute bottom-0 left-0 bg-[#FF8FB1] h-[3px] w-0"></span>
              </h2>

              <div className="space-y-5 text-slate-600 text-sm sm:text-base leading-relaxed font-medium gsap-reveal" data-effect="blur">
                <p>
                  Di Simoengil, kami percaya bahwa boneka bukan sekadar boneka biasa. Ia adalah pendengar setia rahasia anak Anda, pemberi pelukan hangat saat sedih, dan teman bermain terbaik yang menemani setiap tumbuh kembang mereka. Oleh karena itu, kami menuangkan hati dan cinta kami ke dalam setiap detail proses pembuatannya.
                </p>
                <p>
                  Semua boneka kami dikerjakan secara <span className="text-[#FF8FB1] font-extrabold">100% handmade</span> oleh pengrajin lokal berpengalaman yang sangat teliti. Kami menolak produksi massal pabrikan demi menjaga nilai keunikan dan kualitas premium di setiap helai benang.
                </p>
                <p>
                  Kami hanya memilih material grade tertinggi: isian <span className="text-[#E8B37D] font-extrabold">100% Silikon Dacron Grade A murni</span> bebas campuran limbah garmen untuk keempukan super tahan lama, serta kain bulu impor (Yelvo & Spandex) bertekstur ultra lembut yang hypoallergenic dan aman bagi pernapasan sensitif si kecil.
                </p>
              </div>

              {/* Highlight Quote */}
              <div className="relative pl-6 border-l-4 border-[#FF8FB1] py-2 bg-white/40 rounded-r-2xl pr-4 gsap-reveal" data-effect="fade-up" data-delay="0.1">
                <span className="absolute top-1 left-2 text-4xl text-[#FFB6C8]/40 leading-none font-serif">&ldquo;</span>
                <p className="italic text-[#2C2C2C] font-extrabold text-sm sm:text-base leading-relaxed">
                  Setiap boneka dibuat dengan teliti oleh pengrajin lokal untuk memastikan kelembutan dan kualitas terbaik.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION B: BEHIND THE SCENES & HANDMADE PROCESS */}
      <section id="bts" className="relative z-10 py-20 bg-white/40 backdrop-blur-xs border-y border-[#FFB6C8]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5F0] border border-[#FFB6C8]/30 text-[#FF8FB1] font-bold text-xs uppercase tracking-widest">
              <Gift className="w-3.5 h-3.5" />
              <span>Handmade Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2C2C2C] tracking-tight font-heading gsap-section-title relative inline-block pb-3">
              Behind The Scenes
              <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FF8FB1] h-[3px] w-0"></span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto gsap-reveal" data-effect="blur">
              Lihat bagaimana bahan premium pilihan ditransformasikan menjadi teman pelukan gemoy yang siap mengisi harimu.
            </p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:overflow-visible md:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            
            {/* Step 1 */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center bg-white rounded-[2rem] p-6 border border-[#FFB6C8]/20 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_35px_rgba(255,182,200,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group gsap-reveal" data-effect="fade-up" data-delay="0.1">
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-[#FFF8F3]">
                  <img 
                    src="/images/detail_fabric.png" 
                    alt="Langkah 1: Pola & Pemotongan" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-3 left-3 bg-[#FF8FB1] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                    1
                  </div>
                </div>
                <h3 className="font-heading font-black text-[#2C2C2C] text-base mb-2">Pola & Pemotongan Kain</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Kain impor yelvo & rasfur hypoallergenic dipotong presisi menggunakan cetakan pola orisinal Simoengil.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center bg-white rounded-[2rem] p-6 border border-[#FFB6C8]/20 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_35px_rgba(255,182,200,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group gsap-reveal" data-effect="fade-up" data-delay="0.2">
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-[#FFF5F0] to-[#FFFDF0] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#E8B37D]/10 flex items-center justify-center text-[#E8B37D] font-black text-2xl">🧵</div>
                  <div className="absolute bottom-3 left-3 bg-[#FF8FB1] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                    2
                  </div>
                </div>
                <h3 className="font-heading font-black text-[#2C2C2C] text-base mb-2">Proses Jahit Manual</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Dijahit satu per satu dengan benang ekstra kuat oleh penjahit lokal terampil untuk daya tahan jahitan maksimal.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center bg-white rounded-[2rem] p-6 border border-[#FFB6C8]/20 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_35px_rgba(255,182,200,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group gsap-reveal" data-effect="fade-up" data-delay="0.3">
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-[#FFF8F3] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FFB6C8]/10 flex items-center justify-center text-[#FF8FB1] font-black text-2xl">☁️</div>
                  <div className="absolute bottom-3 left-3 bg-[#FF8FB1] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                    3
                  </div>
                </div>
                <h3 className="font-heading font-black text-[#2C2C2C] text-base mb-2">Isian 100% Dacron</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Pengisian Dacron Grade A murni untuk volume optimal. Boneka tetap empuk mengembang walaupun dicuci berulang.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center bg-white rounded-[2rem] p-6 border border-[#FFB6C8]/20 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_35px_rgba(255,182,200,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group gsap-reveal" data-effect="fade-up" data-delay="0.4">
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-[#FFF8F3]">
                  <img 
                    src="/images/detail_giftbox.png" 
                    alt="Langkah 4: QC & Pengemasan" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-3 left-3 bg-[#FF8FB1] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                    4
                  </div>
                </div>
                <h3 className="font-heading font-black text-[#2C2C2C] text-base mb-2">QC Ketat & Packaging</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  Lulus inspeksi jarum dan cacat jahit, disemprot parfum khas Simoengil, lalu dimasukkan ke dalam gift box manis.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATALOG / PRODUCTS GRID */}
      <section id="katalog" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#FFB6C8]/30 text-[#FF8FB1] font-bold text-xs uppercase tracking-widest">
            <Smile className="w-3.5 h-3.5 text-[#E8B37D]" />
            <span>Koleksi Terfavorit</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2C2C2C] tracking-tight font-heading gsap-section-title relative inline-block pb-3">
            Adopsi Teman Peluk Impianmu
            <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FF8FB1] h-[3px] w-0"></span>
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed gsap-reveal" data-effect="blur">
            Pilih dari ragam seri boneka handmade terbaik kami. Tersedia aneka boneka lucu, gantungan kunci gemas, hingga hampers wisuda.
          </p>
        </div>

        {/* Categories Tabs & Search & Sort Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          {/* Categories Tab Badges */}
          <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start flex-1 w-full lg:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#FF8FB1] border-[#FF8FB1] text-white shadow-md shadow-[#FF8FB1]/20 hover:scale-105'
                    : 'bg-white border-[#FFB6C8]/25 text-slate-500 hover:text-[#2C2C2C] hover:border-[#FFB6C8] shadow-xs'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar & Sorting */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Cari boneka impianmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-10 pr-4 rounded-2xl text-xs font-medium bg-white border border-[#FFB6C8]/20 focus:outline-none focus:ring-2 focus:ring-[#FFB6C8] focus:border-[#FFB6C8] shadow-xs transition-colors duration-300"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Sorting and Count */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-xs font-extrabold text-slate-400 bg-white/80 border border-[#FFB6C8]/10 py-3 px-4 rounded-2xl shadow-xs whitespace-nowrap">
                {filteredProducts.length} Teman Peluk
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none py-3 pl-4 pr-10 rounded-2xl text-xs font-bold bg-white border border-[#FFB6C8]/20 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FFB6C8] focus:border-[#FFB6C8] shadow-xs cursor-pointer hover:border-[#FF8FB1] transition-colors duration-300 w-40"
                >
                  <option value="terbaru">✨ Terbaru</option>
                  <option value="termurah">💵 Termurah</option>
                  <option value="termahal">💎 Termahal</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-white border border-[#FFB6C8]/20 flex items-center justify-center mx-auto text-slate-400 text-3xl font-bold shadow-xs animate-float">
              🧸
            </div>
            <div>
              <h3 className="font-heading font-black text-[#2C2C2C] text-base">Tidak Menemukan Boneka Cocok</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Kami tidak menemukan boneka dengan kriteria pencarian &quot;{searchQuery}&quot;. Coba ganti kata kunci pencarian Anda!
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="py-3 px-6 border border-[#FFB6C8] text-[#FF8FB1] hover:bg-[#FFF5F0] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartItemCount={cart.filter(c => c.id === product.id).reduce((sum, c) => sum + c.quantity, 0)}
                onDetailClick={handleProductDetailClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* PROMO BANNER SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-[#FF8FB1] to-[#FFB6C8] p-8 md:p-14 overflow-hidden shadow-lg border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background overlay circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-4 text-center md:text-left z-10 max-w-xl">
            <span className="text-xs font-black bg-white/20 text-white px-4 py-1.5 rounded-full uppercase tracking-wider">
              🎁 Promo Spesial Bulan Ini
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight font-heading">
              Beli 2 Boneka Gemoy, Dapatkan Gantungan Kunci Gratis!
            </h3>
            <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed">
              Dapatkan bonus langsung gantungan kunci beruang/bunny premium untuk setiap pembelian minimal 2 boneka beruang tipe apapun di official store Shopee kami. Promo otomatis berlaku selama persediaan masih ada!
            </p>
          </div>

          <div className="shrink-0 z-10 w-full md:w-auto">
            <a
              href="https://shopee.co.id"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full md:w-auto text-center py-4 px-8 bg-white hover:bg-[#FFF5F0] text-[#FF8FB1] font-extrabold rounded-2xl shadow-md transition-all hover:scale-[1.03] active:scale-95 duration-200"
            >
              Belanja di Shopee & Claim Bonus 🧸
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION (Zielabs Premium Quote Style) */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-transparent via-[#FFF5F0]/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FFB6C8]/30 text-[#FF8FB1] font-bold text-xs uppercase tracking-widest shadow-xs">
              <Smile className="w-3.5 h-3.5 text-[#E8B37D]" />
              <span>Wall of Love</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2C2C2C] tracking-tight font-heading gsap-section-title relative inline-block pb-3">
              Kisah Teman Peluk Simoengil
              <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FF8FB1] h-[3px] w-0"></span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed gsap-reveal" data-effect="blur">
              Ribuan boneka handmade kami telah menemani tidur nyenyak & membawa kebahagiaan di berbagai rumah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white rounded-[2.2rem] p-8 border border-[#FFB6C8]/20 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(255,182,200,0.08)] hover:-translate-y-1 transition-all duration-300 gsap-reveal" data-effect="fade-up" data-delay="0.1">
              <div className="space-y-4">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current text-[#E8B37D]" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                  &quot;Bulunya halus banget rasfur premium, jahitannya sangat rapi dan tebal. Isian dacronnya padat tapi tetap empuk banget dipeluk. Sangat rekomended buat kado anak-anak!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100/60">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20">
                  RN
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex items-center gap-1.5">
                    <span>Ratih Ningsih</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                      ✓ Verified Buyer
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">12 Mei 2026</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-[2.2rem] p-8 border border-[#FFB6C8]/20 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(255,182,200,0.08)] hover:-translate-y-1 transition-all duration-300 gsap-reveal" data-effect="fade-up" data-delay="0.2">
              <div className="space-y-4">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current text-[#E8B37D]" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                  &quot;Beli untuk kado wisuda pacar, respon admin cepat and dapet selempang kustom nama wisuda gratis. Packingnya rapi menggunakan box cantik dan pita pink manis. Worth the price!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100/60">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20">
                  BS
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex items-center gap-1.5">
                    <span>Budi Santoso</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                      ✓ Verified Buyer
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">04 Mei 2026</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-[2.2rem] p-8 border border-[#FFB6C8]/20 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(255,182,200,0.08)] hover:-translate-y-1 transition-all duration-300 gsap-reveal" data-effect="fade-up" data-delay="0.3">
              <div className="space-y-4">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current text-[#E8B37D]" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                  &quot;Anak saya senang sekali dengan boneka ini, dipeluk terus setiap tidur. Bulunya tidak mudah rontok jadi aman untuk balita. Kemarin dicuci mesin tetap mengembang bagus!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100/60">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20">
                  SR
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex items-center gap-1.5">
                    <span>Siti Rahma</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                      ✓ Verified Buyer
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">28 April 2026</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mb-28">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF5F0] border border-[#FFB6C8]/30 text-[#FF8FB1] mb-2 shadow-xs">
            <HelpCircle className="w-5 h-5 text-[#E8B37D]" />
          </div>
          <h2 className="text-3xl font-black text-[#2C2C2C] tracking-tight font-heading gsap-section-title relative inline-block pb-3">
            Pertanyaan Populer (FAQ)
            <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FF8FB1] h-[3px] w-0"></span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium gsap-reveal" data-effect="blur">
            Informasi lengkap seputar kualitas boneka, tata cara cuci, dan pengemasan pesanan.
          </p>
        </div>

        {/* FAQ Accordion list */}
        <div className="space-y-4 gsap-reveal" data-effect="fade-up">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[#FFB6C8]/10 shadow-[0_4px_15px_rgba(0,0,0,0.005)] hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header question */}
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#2C2C2C] text-sm sm:text-base cursor-pointer hover:bg-[#FFF5F0]/20"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#FF8FB1]' : ''}`} />
                </button>

                {/* Answer body */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100 border-t border-[#FFB6C8]/10' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-[#FFF8F3]/40">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A0F1D] text-slate-300 pt-20 pb-10 border-t-[6px] border-[#FF8FB1]">
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
              <li><a href="#" className="hover:text-[#FF8FB1] transition-colors">Halaman Utama</a></li>
              <li><a href="#katalog" className="hover:text-[#FF8FB1] transition-colors">Katalog Produk</a></li>
              <li><a href="#tentang" className="hover:text-[#FF8FB1] transition-colors">Cerita Simoengil</a></li>
              <li><a href="#bts" className="hover:text-[#FF8FB1] transition-colors">Behind The Scenes</a></li>
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

      {/* DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* WISHLIST DRAWER */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} cartItems={cart} onRemoveItem={handleRemoveCartItem} onUpdateQuantity={handleUpdateCartQuantity} onDetailClick={handleProductDetailClick} />
      
      {/* LIVE CHAT */}
      <ChatWidget />

      {/* TRACKING MODAL */}
      <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />

      {/* AUTH MODAL */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}