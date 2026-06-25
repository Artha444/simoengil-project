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

import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
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
  const [sortBy, setSortBy] = useState<string>('terlaris');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const sortRef = React.useRef<HTMLDivElement>(null);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    logoImageType: 'icon',
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
      setIsLoadingProducts(true);
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
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              specifications: {
                material: specs.material || '100% Premium Dacron & Kain Rasfur',
                size: specs.size || 'Standard',
                washing: specs.washing || 'Bisa dicuci dengan tangan atau mesin cuci',
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
          } else {
            setProductsList(PRODUCTS);
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local products list:', err);
        const localMockStr = localStorage.getItem('simoengil_mock_products');
        if (localMockStr) {
          setProductsList(JSON.parse(localMockStr));
        } else {
          setProductsList(PRODUCTS);
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          // Only redirect to admin panel if the role is admin
          if (session.user?.user_metadata?.role === 'admin') {
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
        if (session.user?.user_metadata?.role === 'admin') {
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

    // Check URL parameters for auth redirect
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'true') {
        setIsAuthModalOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        url.searchParams.delete('required');
        window.history.replaceState({}, '', url.toString());
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Logic handled in the authListener above
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
    if (sortBy === 'terlaris') {
      const soldA = a.specifications?.soldCount || 0;
      const soldB = b.specifications?.soldCount || 0;
      return soldB - soldA;
    }
    return 0;
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
    q: 'Apakah boneka flanel Simoengil aman untuk bayi dan balita?',
    a: 'Sangat aman, Bu. Boneka kami terbuat dari kain flanel premium yang lembut dan hypoallergenic (tidak mudah menyebabkan alergi). Jahitannya rapi, tidak ada bagian kecil yang mudah lepas, sehingga aman untuk anak kecil dan bayi.'
  },
  {
    q: 'Boneka flanel boleh dicuci tidak?',
    a: 'Boneka flanel sebaiknya **tidak dicuci dengan mesin cuci** agar bulu dan bentuknya tetap bagus. Saran kami: cukup lap dengan kain bersih yang dibasahi air hangat kuku + sedikit sabun bayi. Jika kotor sekali, bisa dibawa ke laundry dry clean. Hindari merendam lama agar tidak merusak kain flanel.'
  },
  {
    q: 'Apakah bisa pesan boneka untuk kado wisuda dengan custom nama?',
    a: 'Tidak bisa, untuk pesanan custom tidak dilakukan di website, jika ingin dilakukan custom silahkan lakukan pembelian di Shopee'
  },
  {
    q: 'Berapa lama proses packing dan pengiriman?',
    a: 'Kami packing dan kirim setiap hari. Pesanan yang masuk sebelum jam 15.00 WIB biasanya dikirim di hari yang sama. Untuk Jabodetabek tersedia pengiriman sameday/instan melalui Shopee.'
  },
  {
    q: 'Apakah ada garansi jika boneka rusak atau cacat?',
    a: 'Ada garansi kualitas. Jika dalam 7 hari setelah terima ada cacat produksi (jahitan lepas, bahan robek, dll), silakan hubungi kami via WhatsApp untuk proses penggantian atau pengembalian.'
  }
];
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-pink-100 selection:text-pink-600 bg-transparent font-sans text-slate-800">
      <GSAPInitializer />
      
      {/* Dynamic Floating Background Elements (Illustrations) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[35vw] h-[35vw] rounded-full bg-pink-200/20 blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-orange-100/20 blur-3xl" />
      </div>

      {/* HEADER / NAVBAR */}
      

      <main className="flex-1 w-full overflow-x-hidden">
      {/* CATALOG / PRODUCTS GRID */}
      <section id="katalog" className="relative z-10 pt-12 pb-24 w-full px-4 sm:px-6 lg:px-8 min-h-screen">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-4">
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
              
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center justify-between py-3 pl-4 pr-4 rounded-2xl text-xs font-bold bg-white border border-[#FFB6C8]/20 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FFB6C8] shadow-xs cursor-pointer hover:border-[#FF8FB1] transition-colors duration-300 w-40"
                >
                  <span className="flex items-center gap-2">
                    {sortBy === 'terlaris' && <Sparkles className="w-4 h-4 text-[#FF8FB1]" />}
                    {sortBy === 'termurah' && <LucideIcons.TrendingDown className="w-4 h-4 text-emerald-500" />}
                    {sortBy === 'termahal' && <LucideIcons.TrendingUp className="w-4 h-4 text-rose-500" />}
                    {sortBy === 'terlaris' ? 'Terlaris' : sortBy === 'termurah' ? 'Termurah' : 'Termahal'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortOpen && (
                  <div className="absolute z-50 top-full mt-2 w-40 bg-white border border-[#FFB6C8]/20 rounded-2xl shadow-lg overflow-hidden flex flex-col py-2">
                    <button
                      onClick={() => { setSortBy('terlaris'); setIsSortOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-[#FFF5F0] transition-colors ${sortBy === 'terlaris' ? 'text-[#FF8FB1]' : 'text-slate-600'}`}
                    >
                      <Sparkles className="w-4 h-4" /> Terlaris
                    </button>
                    <button
                      onClick={() => { setSortBy('termurah'); setIsSortOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-[#FFF5F0] transition-colors ${sortBy === 'termurah' ? 'text-emerald-500' : 'text-slate-600'}`}
                    >
                      <LucideIcons.TrendingDown className="w-4 h-4" /> Termurah
                    </button>
                    <button
                      onClick={() => { setSortBy('termahal'); setIsSortOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-[#FFF5F0] transition-colors ${sortBy === 'termahal' ? 'text-rose-500' : 'text-slate-600'}`}
                    >
                      <LucideIcons.TrendingUp className="w-4 h-4" /> Termahal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-3 shadow-md border border-slate-100 flex flex-col h-full overflow-hidden relative group animate-pulse">
                <div className="relative aspect-square w-full rounded-3xl bg-slate-200 overflow-hidden mb-4 shrink-0"></div>
                <div className="flex-1 flex flex-col px-1 justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5 opacity-0">
                      <div className="flex -space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <LucideIcons.Star key={i} className="w-3.5 h-3.5 fill-[#FFB6C8] text-[#FFB6C8]" />
                        ))}
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100/60">
                    <div className="h-6 bg-slate-200 rounded w-2/3 mb-3"></div>
                    <div className="w-full h-11 bg-slate-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-white border border-[#FFB6C8]/20 flex items-center justify-center mx-auto text-slate-400 shadow-xs animate-float">
              <LucideIcons.SearchX className="w-10 h-10 text-[#FF8FB1]" />
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
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                product={product}
                cartItemCount={cart.filter(c => c.id === product.id).reduce((sum, c) => sum + c.quantity, 0)}
                onDetailClick={handleProductDetailClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* PROMO BANNER SECTION */}
      {/* <section className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-[#FF8FB1] to-[#FFB6C8] p-8 md:p-14 overflow-hidden shadow-lg border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
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
      </section> */}



        {/* FOOTER */}
        <footer className="bg-[#0A0F1D] text-slate-300 pt-20 pb-10 border-t-[6px] border-[#FF8FB1]">
          <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Logo & Description */}
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center shadow-md overflow-hidden">
                  <img
                    src="/images/logo.png"
                    alt="Simoengil Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-xl font-bold text-white tracking-wide font-heading leading-none">
                    Simoengil
                  </span>
                  <span className="block text-[10px] text-[#E8B37D] font-extrabold uppercase tracking-widest mt-1">
                    Premium Handmade Plushie
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
                Penyedia boneka & plushie premium buatan lokal berkualitas
                ekspor. Menggunakan bahan 100% silikon dacron murni yang
                hypoallergenic, aman bagi balita, dan mudah dibersihkan.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#FF8FB1] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-4.5 h-4.5 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#25D366] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95"
                  aria-label="WhatsApp"
                >
                  <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-5 h-5"
          >
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
          </svg>
                </a>
                <a
                  href="https://shopee.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#ee4d2d] hover:text-white transition-all text-slate-300 hover:scale-105 active:scale-95"
                  aria-label="Shopee"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Boneka Simoengil.</p>
          </div>
        </footer>

      {/* DETAIL MODAL */}
      <ProductDetailModal
        key={selectedProduct?.id || 'no-product'}
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={handleProductDetailClick}
        isLoggedIn={!!user}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />
      
      {/* LIVE CHAT */}


      {/* TRACKING MODAL */}
      <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />

      {/* AUTH MODAL */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </main>
    </div>
  );
}

