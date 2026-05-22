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
  ShoppingBag, 
  ChevronDown,
  Gift,
  HeartHandshake
} from 'lucide-react';
import { Product, PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} />;
};

export default function Home() {
  // State
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<any>({
    heroTitle: 'Temukan Teman Peluk Pertamamu!',
    heroDescription: 'Toko online Boneka Simoengil menyediakan aneka plushie & boneka super lembut berkualitas tinggi. Terbuat dari 100% premium dacron grade A, hypoallergenic, aman untuk anak-anak, dan bisa dicuci sesering mungkin tanpa khawatir kempis!',
    whyTitle: 'Kenapa Memilih Boneka Simoengil?',
    whyFeatures: [
      { icon: 'ShieldCheck', title: '100% Dacron Grade A', desc: 'Isian silikon dacron super murni tanpa campuran limbah garmen. Memastikan keempukan tahan bertahun-tahun dan tidak gampang kempes.' },
      { icon: 'RefreshCw', title: 'Bisa Dicuci (Washable)', desc: 'Mudah dibersihkan! Cukup dicuci dengan tangan atau mesin cuci (putaran halus). Dacron akan mengembang kembali begitu kering sempurna.' },
      { icon: 'Smile', title: 'Aman untuk Bayi', desc: 'Kain luar bulu yelvo/spandex hypoallergenic berbulu lembut dan tidak mudah rontok. Lulus uji kualitas aman bagi pernapasan balita.' }
    ]
  });

  // Load wishlist from localStorage on mount & Fetch Supabase products & Check Admin Auth
  useEffect(() => {
    const savedWishlist = localStorage.getItem('simoengil_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to load wishlist', e);
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
          setProductsList(mappedData);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local products list:', err);
      }
    };

    const checkAdminSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAdmin(!!session);
      } catch (err) {
        console.warn('Could not retrieve auth session:', err);
      }
    };

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
        console.warn('Failed to fetch site settings', err);
      }
    };

    fetchProducts();
    checkAdminSession();
    fetchSettings();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync wishlist to localStorage
  const handleWishlistToggle = (id: string) => {
    let updatedWishlist: string[];
    if (wishlist.includes(id)) {
      updatedWishlist = wishlist.filter(item => item !== id);
    } else {
      updatedWishlist = [...wishlist, id];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('simoengil_wishlist', JSON.stringify(updatedWishlist));
  };

  // Remove single item from wishlist drawer
  const handleRemoveWishlistItem = (id: string) => {
    const updatedWishlist = wishlist.filter(item => item !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem('simoengil_wishlist', JSON.stringify(updatedWishlist));
  };

  // Filter products using dynamic productsList
  const filteredProducts = productsList.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get wishlisted product details
  const wishlistProducts = productsList.filter(product => wishlist.includes(product.id));

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
    <div className="relative min-h-screen flex flex-col overflow-x-hidden selection:bg-pink-100 selection:text-pink-600">
      
      {/* Dynamic Floating Background Elements (Illustrations) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pastel Circle Light Blue */}
        <div className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-100/30 blur-3xl" />
        {/* Pastel Circle Pink */}
        <div className="absolute top-[40%] -right-[10%] w-[35vw] h-[35vw] rounded-full bg-pink-100/30 blur-3xl" />
        {/* Pastel Circle Yellow */}
        <div className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-yellow-100/20 blur-3xl" />
        
        {/* Floating clouds/stars */}
        <div className="absolute top-28 right-[15%] w-16 h-10 bg-white/70 rounded-full blur-[2px] animate-float opacity-40 hidden md:block" />
        <div className="absolute top-[45%] left-[8%] w-20 h-12 bg-white/70 rounded-full blur-[3px] animate-float-slow opacity-30 hidden md:block" />
        <div className="absolute bottom-[30%] right-[8%] w-14 h-9 bg-white/70 rounded-full blur-[2px] animate-float-fast opacity-40 hidden md:block" />
      </div>

      {/* Premium Admin Storefront Bar */}
      {isAdmin && (
        <div className="sticky top-0 z-50 w-full h-14 bg-slate-900/95 backdrop-blur-md border-b border-pink-500/30 text-white px-4 shadow-lg flex items-center transition-all duration-300">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 animate-pulse text-lg">✨</span>
              <p className="text-xs sm:text-sm font-semibold tracking-wide">
                Selamat datang, <span className="text-pink-300 font-black">Admin Simoengil</span>! Anda masuk menggunakan akun admin.
              </p>
            </div>
            <Link
              href="/admin-panel/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-black py-2 px-4 rounded-xl shadow-md shadow-pink-500/20 hover:shadow-lg transition-all hover:scale-[1.03] cursor-pointer"
            >
              <span>🧸 Kembali ke Dashboard Admin</span>
            </Link>
          </div>
        </div>
      )}

      {/* HEADER / NAVBAR */}
      <header className={`sticky ${isAdmin ? 'top-14' : 'top-0'} z-40 bg-white/80 backdrop-blur-md border-b border-blue-100/50 shadow-xs transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Shop Name */}
          <a href="#" className="flex items-center gap-2 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-400 to-pink-300 flex items-center justify-center shadow-md shadow-pink-400/20 group-hover:scale-105 transition-transform duration-300">
              <Smile className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-pink-500 transition-colors">
                Simoengil
              </span>
              <span className="block text-[10px] text-pink-500 font-extrabold uppercase tracking-widest mt-[-2px]">
                Plushie & Doll
              </span>
            </div>
          </a>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Cari boneka peluk impianmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-blue-100 focus:border-pink-300 focus:outline-hidden focus:ring-4 focus:ring-pink-100/50 bg-blue-50/20 text-sm font-semibold transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Shopee Profile */}
            <a
              href="https://shopee.co.id/kumiko_shoppu"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 text-[#ee4d2d] transition-all flex items-center justify-center"
              title="Official Shopee Simoengil"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
              </svg>
            </a>

            {/* Tokopedia Profile */}
            <a
              href="https://www.tokopedia.com/bonekasimoengil"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 text-[#42b549] transition-all flex items-center justify-center"
              title="Official Tokopedia Simoengil"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </a>

            {/* Lazada Profile */}
            <a
              href="https://www.lazada.co.id/shop/boneka-simoengil"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 text-[#0f136d] transition-all flex items-center justify-center"
              title="Official Lazada Simoengil"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2zm0 3.99L18.66 19H5.34L12 5.99z"/>
              </svg>
            </a>

            {/* TikTok Profile */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 text-slate-900 transition-all flex items-center justify-center"
              title="Official TikTok Simoengil"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17.93.99 2.22 1.62 3.56 1.83v3.74c-1.38-.02-2.73-.39-3.93-1.09-.34-.2-.67-.44-.97-.71V15c.02 1.7-.5 3.39-1.52 4.73-1.4 1.87-3.69 3.03-6.07 3.04-2.18-.01-4.29-.97-5.69-2.63-1.63-1.88-2.39-4.51-2.02-7 .42-2.82 2.37-5.26 5.09-6.17v3.83c-1.14.39-2.06 1.29-2.45 2.45-.48 1.41-.21 3.01.69 4.19.86 1.12 2.21 1.78 3.62 1.78 1.25 0 2.44-.52 3.26-1.46.77-.87 1.17-2.03 1.15-3.21V.02z"/>
              </svg>
            </a>

            {/* Wishlist Icon Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100/70 border border-pink-100/50 text-pink-500 transition-all flex items-center justify-center cursor-pointer group"
              aria-label="Buka Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden px-4 pb-4 border-b border-blue-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari boneka peluk impianmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-blue-100 focus:border-pink-300 focus:outline-hidden focus:ring-4 focus:ring-pink-100/50 bg-blue-50/20 text-xs font-semibold transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-8 pb-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Info */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-100/70 border border-pink-200 text-pink-600 font-bold text-xs animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spesialis Plushie Higienis & Premium</span>
          </div>

          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight"
            dangerouslySetInnerHTML={{ __html: siteSettings.heroTitle.replace(/Pertamamu/g, '<span className="text-pink-500 relative">Pertamamu<span className="absolute bottom-1 left-0 w-full h-3 bg-pink-100 -z-10 rounded-sm" /></span>') }}
          />

          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            {siteSettings.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {/* CTA Button */}
            <a
              href="#katalog"
              onClick={handleHeroCtaClick}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-extrabold rounded-2xl text-center shadow-lg shadow-pink-500/20 hover:shadow-xl hover:scale-[1.03] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lihat Koleksi Lucu</span>
              <span className="text-lg">🧸</span>
            </a>

            {/* Sub-link */}
            <a
              href="#spesifikasi"
              className="w-full sm:w-auto px-6 py-4 border border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50/50 transition-all text-center cursor-pointer"
            >
              Kenapa Pilih Simoengil?
            </a>
          </div>

          {/* Social Proof */}
          <div className="pt-6 border-t border-blue-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">✓</div>
              <span>Dacron Premium 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">✓</div>
              <span>Bisa Dicuci (Washable)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">✓</div>
              <span>Pengiriman Tiap Hari</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Showcase Images */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 md:px-12">
          {/* Main Showcase Card */}
          <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-blue-100 w-full max-w-[420px] aspect-square flex items-center justify-center animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-50 to-blue-50 rounded-3xl -z-10" />
            <img
              src="/images/plushie_teddy.png"
              alt="Main Plushie Bear"
              className="w-5/6 h-5/6 object-contain drop-shadow-2xl"
            />
            {/* Small floating badges on hero */}
            <div className="absolute -top-4 -right-4 bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-black py-2 px-4 rounded-2xl shadow-sm rotate-6 flex items-center gap-1">
              <span>🌟</span>
              <span>Terlembut</span>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white border border-pink-100 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-2xl shadow-md flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 text-[10px]">❤️</div>
              <span>Anti Alergi</span>
            </div>
          </div>

          {/* Secondary smaller floating card */}
          <div className="absolute -bottom-6 right-2 sm:right-6 bg-white rounded-2xl p-3 shadow-lg border border-pink-50 w-36 aspect-square hidden sm:flex items-center justify-center animate-float-slow">
            <img
              src="/images/plushie_bunny.png"
              alt="Mini Bunny Plushie"
              className="w-5/6 h-5/6 object-contain"
            />
          </div>
        </div>
      </section>

      {/* MID SECTION: BRAND STRENGTHS / FEATURES */}
      <section id="spesifikasi" className="relative z-10 bg-white border-y border-blue-100/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
              {siteSettings.whyTitle}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Kami berkomitmen memproduksi teman peluk yang higienis, tahan lama, dan berkualitas premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {siteSettings.whyFeatures.map((feat: any, idx: number) => {
              const bgColors = ['bg-blue-50/30 border-blue-100/30', 'bg-pink-50/20 border-pink-100/20', 'bg-yellow-50/30 border-yellow-100/20'];
              const iconColors = ['bg-blue-100 text-blue-600', 'bg-pink-100 text-pink-500', 'bg-yellow-100 text-yellow-600'];
              const colorIdx = idx % 3;
              
              return (
                <div key={idx} className={`${bgColors[colorIdx]} border rounded-3xl p-6 text-center space-y-4 hover:shadow-md transition-shadow`}>
                  <div className={`w-12 h-12 rounded-2xl ${iconColors[colorIdx]} flex items-center justify-center mx-auto shadow-xs`}>
                    <DynamicIcon name={feat.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">{feat.title}</h3>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATALOG / PRODUCTS GRID */}
      <section id="katalog" className="relative z-10 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Katalog Boneka Gemoy
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Temukan aneka pilihan boneka lucu, gantungan kunci gemas, hingga hampers wisuda kelulusan.
          </p>
        </div>

        {/* Categories Tabs & Search Input Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Categories Tab Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-pink-400 to-pink-500 border-pink-400 text-white shadow-md shadow-pink-500/10 hover:shadow-lg'
                    : 'bg-white border-blue-100 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Showing Count */}
          <div className="text-xs font-extrabold text-slate-400 bg-blue-50/50 py-2 px-4 rounded-xl border border-blue-100/50">
            Menampilkan {filteredProducts.length} Produk
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-2xl font-bold border border-slate-200">
              🔍
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tidak Menemukan Boneka Cocok</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Kami tidak menemukan boneka dengan kriteria pencarian &quot;{searchQuery}&quot;. Coba ganti kata kunci pencarian Anda!
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="py-2.5 px-6 border border-pink-300 text-pink-500 font-bold rounded-xl text-xs hover:bg-pink-50 transition-all cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onWishlistToggle={handleWishlistToggle}
                onDetailClick={handleProductDetailClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* PROMO BANNER SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl bg-gradient-to-tr from-pink-400/90 to-pink-300 p-8 md:p-12 overflow-hidden shadow-xl border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background overlay circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-4 text-center md:text-left z-10 max-w-xl">
            <span className="text-xs font-black bg-white/30 text-white px-3 py-1 rounded-full uppercase tracking-wider">
              🎁 Promo Spesial Bulan Ini
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Beli 2 Boneka Beruang Dapat Gratis Gantungan Kunci Fluffy!
            </h3>
            <p className="text-white/95 text-xs sm:text-sm font-medium leading-relaxed">
              Dapatkan bonus langsung gantungan kunci beruang/bunny premium untuk setiap pembelian minimal 2 boneka beruang tipe apapun di official store Shopee kami. Promo otomatis berlaku selama persediaan masih ada!
            </p>
          </div>

          <div className="shrink-0 z-10 w-full md:w-auto">
            <a
              href="https://shopee.co.id"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full md:w-auto text-center py-4 px-8 bg-white hover:bg-slate-50 text-pink-600 font-extrabold rounded-2xl shadow-md transition-all hover:scale-[1.03]"
            >
              Klaim Promo di Shopee 🧸
            </a>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center mb-10">
          <div className="inline-flex p-2 rounded-2xl bg-blue-100/70 border border-blue-200 text-blue-600 mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pertanyaan Populer (FAQ)</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Informasi lengkap seputar kualitas boneka, tata cara cuci, dan pengemasan pesanan.
          </p>
        </div>

        {/* FAQ Accordion list */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-blue-50 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header question */}
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-sm sm:text-base cursor-pointer hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-500' : ''}`} />
                </button>

                {/* Answer body */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-blue-50/10">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">Simoengil Store</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Penyedia boneka & plushie premium buatan lokal berkualitas ekspor. Menggunakan isi 100% silikon dacron murni yang aman bagi balita dan mudah dibersihkan.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" className="p-2 rounded-xl bg-slate-800 hover:bg-pink-500 hover:text-white transition-colors text-slate-300" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://wa.me" target="_blank" className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-white transition-colors text-slate-300" aria-label="WhatsApp">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="https://shopee.co.id" target="_blank" className="p-2 rounded-xl bg-slate-800 hover:bg-[#ee4d2d] hover:text-white transition-colors text-slate-300" aria-label="Shopee">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
                </svg>
              </a>
              <a href="https://tokopedia.com" target="_blank" className="p-2 rounded-xl bg-slate-800 hover:bg-[#42b549] hover:text-white transition-colors text-slate-300" aria-label="Tokopedia">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </a>
              <a href="https://lazada.co.id" target="_blank" className="p-2 rounded-xl bg-slate-800 hover:bg-[#0f136d] hover:text-white transition-colors text-slate-300" aria-label="Lazada">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 22h20L12 2zm0 3.99L18.66 19H5.34L12 5.99z"/>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" className="p-2 rounded-xl bg-slate-800 hover:bg-black hover:text-white transition-colors text-slate-300" aria-label="TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17.93.99 2.22 1.62 3.56 1.83v3.74c-1.38-.02-2.73-.39-3.93-1.09-.34-.2-.67-.44-.97-.71V15c.02 1.7-.5 3.39-1.52 4.73-1.4 1.87-3.69 3.03-6.07 3.04-2.18-.01-4.29-.97-5.69-2.63-1.63-1.88-2.39-4.51-2.02-7 .42-2.82 2.37-5.26 5.09-6.17v3.83c-1.14.39-2.06 1.29-2.45 2.45-.48 1.41-.21 3.01.69 4.19.86 1.12 2.21 1.78 3.62 1.78 1.25 0 2.44-.52 3.26-1.46.77-.87 1.17-2.03 1.15-3.21V.02z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigasi Toko</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-pink-400 transition-colors">Halaman Utama</a></li>
              <li><a href="#katalog" className="hover:text-pink-400 transition-colors">Katalog Produk</a></li>
              <li><a href="#spesifikasi" className="hover:text-pink-400 transition-colors">Mengapa Kami</a></li>
              <li><a href="https://shopee.co.id" className="hover:text-pink-400 transition-colors">Official Shopee</a></li>
            </ul>
          </div>

          {/* Contact & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hubungi Kami</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>📍 Jakarta, Indonesia</li>
              <li>✉️ halo@simoengilplushie.com</li>
              <li>💬 WhatsApp: +62 812-3456-7890</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Boneka Simoengil. Seluruh Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan penuh kehangatan <Heart className="w-3.5 h-3.5 fill-pink-500 stroke-pink-500" /> untuk sahabat kecilmu.
          </p>
        </div>
      </footer>

      {/* DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onWishlistToggle={handleWishlistToggle}
      />

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistProducts}
        onRemoveItem={handleRemoveWishlistItem}
        onDetailClick={handleProductDetailClick}
      />
      
    </div>
  );
}
