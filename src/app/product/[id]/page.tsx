'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageSquare, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  RefreshCw, 
  Smile, 
  ThumbsUp, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { PRODUCTS, Product } from '@/data/products';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  // Unwrap Next.js 15 params promise
  const { id } = use(params);
  
  // States
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Load product from Supabase & Check Admin Session
  useEffect(() => {
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

    const checkAdminSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAdmin(!!session);
      } catch (err) {
        console.warn('Could not retrieve auth session:', err);
      }
    };

    fetchProduct();
    checkAdminSession();

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
      <div className="min-h-screen bg-blue-50/40 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Sedang memeluk data boneka...</p>
        </div>
      </div>
    );
  }

  // Fallback if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-blue-50/40 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-blue-100 space-y-6">
          <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 mx-auto text-pink-400 text-4xl animate-float">
            🧸
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Teman Peluk Tidak Ditemukan</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Maaf, boneka yang Anda cari mungkin sudah diadopsi oleh orang lain atau sedang istirahat di gudang kami.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-pink-500/10 hover:shadow-lg text-center"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Derived state
  const hasVariants = !!(product.variants && product.variants.length > 0);
  const selectedVariant = product.variants?.find((v) => v.size === selectedSize) || null;
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const isPurchaseDisabled = hasVariants && !selectedSize;

  const isShopeeAvailable = selectedVariant ? (selectedVariant.shopeeAvailable !== false) : (product.shopeeAvailable !== false);
  const isTokopediaAvailable = selectedVariant ? (selectedVariant.tokopediaAvailable !== false) : (product.tokopediaAvailable !== false);
  const isLazadaAvailable = selectedVariant ? (selectedVariant.lazadaAvailable !== false) : (product.lazadaAvailable !== false);
  const isTiktokAvailable = selectedVariant ? (selectedVariant.tiktokAvailable !== false) : (product.tiktokAvailable !== false);

  // Gallery images list (Main product photo + additional images or fallbacks)
  const additionalImages = (product.specifications?.images || product.images || []).filter(Boolean);
  const galleryImages = [
    product.image,
    ...additionalImages
  ];

  // Format IDR Price
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (productName: string, sizeName: string | null) => {
    const sizeText = sizeName ? ` ukuran ${sizeName}` : '';
    const text = `Halo Min, saya tertarik dengan Boneka ${productName}${sizeText} yang ada di website.`;
    return `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ff8fa3', '#ff4d6d'],
      });
    }
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
    <div className="min-h-screen bg-gradient-to-tr from-blue-50/50 via-cream-50/30 to-pink-50/20 text-slate-800 font-sans pb-16">
      
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

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-pink-100/35 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-pink-500 transition-colors group"
          >
            <div className="p-2 rounded-xl bg-white shadow-xs group-hover:shadow-md border border-blue-50 group-hover:border-pink-100 transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Kembali ke Katalog</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Share */}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Tautan halaman berhasil disalin!');
              }}
              className="p-2.5 rounded-xl bg-white shadow-xs border border-blue-50 hover:border-pink-100 text-slate-500 hover:text-pink-500 transition-all cursor-pointer"
              title="Salin Tautan"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {/* Wishlist */}
            <button
              onClick={handleWishlistToggle}
              className="p-2.5 rounded-xl bg-white shadow-xs border border-blue-50 hover:border-pink-100 text-slate-500 hover:text-pink-500 transition-all cursor-pointer group"
              title="Tambah ke Favorit"
            >
              <Heart className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isWishlisted ? 'fill-brand-pink-dark stroke-brand-pink-dark' : 'stroke-slate-500'}`} />
            </button>
          </div>
        </div>

        {/* TWO-COLUMN PRODUCT DETAILS */}
        <div className="bg-white rounded-3xl border border-blue-100/50 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* LEFT COLUMN: IMAGE GALLERY VIEWER */}
            <div className="space-y-4">
              {/* Main Image Frame */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
 
              {/* Thumbnails list */}
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((imgSrc, index) => {
                  const isActive = activeImage === imgSrc || (index === 0 && activeImage === '');
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgSrc)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 transition-all cursor-pointer hover:border-pink-300 ${
                        isActive ? 'border-pink-400 shadow-md scale-95' : 'border-slate-100'
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
            </div>

            {/* RIGHT COLUMN: PRODUCT META & ORDER ACTIONS */}
            <div className="flex flex-col justify-between space-y-6">
              
              <div>
                {/* Category & Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                    {product.category}
                  </span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    {product.status}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-2 leading-tight tracking-tight">
                  {product.name}
                </h1>

                {/* Rating summary */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 fill-current ${
                          i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviewsCount} Rating Pembeli)</span>
                </div>

                {/* Multi-Platform Pricing Grid */}
                <div className="mb-6 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    {selectedVariant ? 'Harga Ukuran Terpilih di Berbagai Marketplace:' : 'Harga Mulai Dari di Berbagai Marketplace:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Tokopedia */}
                    <div className="bg-emerald-50/60 border border-emerald-100/70 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] font-black text-[#42b549] uppercase tracking-wider mb-0.5">Tokopedia</span>
                      <span className={`${isTokopediaAvailable ? 'text-sm sm:text-base font-extrabold text-[#42b549]' : 'text-[10px] font-bold text-slate-400'}`}>
                        {isTokopediaAvailable
                          ? formatIDR(selectedVariant?.tokopediaPrice ?? product.tokopediaPrice ?? (selectedVariant?.price ?? product.price))
                          : 'tidak tersedia di marketplace ini'
                        }
                      </span>
                    </div>

                    {/* Shopee */}
                    <div className="bg-orange-50/60 border border-orange-100/70 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] font-black text-[#ee4d2d] uppercase tracking-wider mb-0.5">Shopee</span>
                      <span className={`${isShopeeAvailable ? 'text-sm sm:text-base font-extrabold text-[#ee4d2d]' : 'text-[10px] font-bold text-slate-400'}`}>
                        {isShopeeAvailable
                          ? formatIDR(selectedVariant?.shopeePrice ?? product.shopeePrice ?? (selectedVariant?.price ?? product.price))
                          : 'tidak tersedia di marketplace ini'
                        }
                      </span>
                    </div>

                    {/* Lazada */}
                    <div className="bg-blue-50/60 border border-blue-100/70 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] font-black text-[#0f136d] uppercase tracking-wider mb-0.5">Lazada</span>
                      <span className={`${isLazadaAvailable ? 'text-sm sm:text-base font-extrabold text-[#0f136d]' : 'text-[10px] font-bold text-slate-400'}`}>
                        {isLazadaAvailable
                          ? formatIDR(selectedVariant?.lazadaPrice ?? product.lazadaPrice ?? (selectedVariant?.price ?? product.price))
                          : 'tidak tersedia di marketplace ini'
                        }
                      </span>
                    </div>

                    {/* TikTok */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-0.5">TikTok Shop</span>
                      <span className={`${isTiktokAvailable ? 'text-sm sm:text-base font-extrabold text-slate-800' : 'text-[10px] font-bold text-slate-400'}`}>
                        {isTiktokAvailable
                          ? formatIDR(selectedVariant?.tiktokPrice ?? product.tiktokPrice ?? (selectedVariant?.price ?? product.price))
                          : 'tidak tersedia di marketplace ini'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Size Selection Section */}
                {hasVariants && (
                  <div className="mb-6 space-y-2.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Pilih Ukuran:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.variants?.map((v) => {
                        const isSelected = selectedSize === v.size;
                        return (
                          <button
                            key={v.size}
                            onClick={() => setSelectedSize(v.size)}
                            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer hover:scale-105 duration-200 ${
                              isSelected
                                ? 'bg-pink-400 border-pink-400 text-white shadow-md shadow-pink-500/25'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-500'
                            }`}
                          >
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description highlights */}
                <div className="prose prose-sm text-slate-600 leading-relaxed mb-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Deskripsi</h3>
                  <p dangerouslySetInnerHTML={{ __html: product.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>

                {/* Key Material Highlights */}
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 space-y-3 mb-6">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    Kelebihan Boneka Simoengil:
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    {product.specifications?.features && product.specifications.features.length > 0 ? (
                      product.specifications.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-700">Bahan Halus Rasfur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-700">Isi 100% Silikon Dakron Premium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-700">Aman untuk Anak-anak</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-700">Mudah Dicuci (Washable)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Specifications list */}
                <div className="border-t border-slate-100 pt-5 space-y-2.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Ukuran / Dimensi</span>
                    <span className="font-bold text-slate-700">{product.specifications.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Bahan Luar & Isi</span>
                    <span className="font-bold text-slate-700">{product.specifications.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Rekomendasi Cuci</span>
                    <span className="font-bold text-slate-700">{product.specifications.washing}</span>
                  </div>
                </div>
              </div>

              {/* ORDER ACTIONS SECTION */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                
                {/* 1. Hubungi via WhatsApp Button */}
                <a
                  href={getWhatsAppLink(product.name, selectedSize)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsappSent(true)}
                  className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-extrabold text-sm transition-all shadow-md shadow-green-500/10 hover:shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2.5 cursor-pointer text-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.01 14.137.985 11.998.985 6.559.985 2.137 5.357 2.133 10.789c-.001 1.666.443 3.291 1.285 4.743L2.43 19.982l4.217-1.108zm12.513-6.812c-.332-.165-1.962-.968-2.266-1.077-.303-.11-.525-.165-.745.165-.22.33-.85.744-1.04.96-.19.217-.381.244-.713.079-.332-.165-1.401-.515-2.668-1.644-.986-.88-1.652-1.968-1.846-2.298-.19-.33-.02-.508.145-.672.148-.148.332-.386.498-.578.166-.193.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.165-.745-1.79-.988-2.38-.243-.59-.49-.51-.672-.519-.172-.008-.37-.01-.568-.01-.199 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.962-.801 2.24-1.575.276-.774.276-1.439.194-1.575-.083-.137-.303-.22-.635-.386z" />
                  </svg>
                  <span>Hubungi via WhatsApp (Tanya Admin)</span>
                </a>
                
                {whatsappSent && (
                  <p className="text-center text-[10px] text-emerald-600 font-bold bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                    ✓ Membuka WhatsApp chat... Mohon selesaikan pesan Anda dengan Admin.
                  </p>
                )}

                {/* 2. Secondary marketplace buttons side-by-side */}
                <div className="space-y-3">
                  {isPurchaseDisabled && (
                    <div className="text-center text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 animate-pulse">
                      <span>🌸</span>
                      <span>Pilih Ukuran Terlebih Dahulu</span>
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
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        (isPurchaseDisabled || !isShopeeAvailable || !(selectedVariant?.shopeeUrl || product.shopeeLink))
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                          : 'bg-shopee hover:bg-shopee-hover text-white shadow-md shadow-orange-500/10 hover:shadow-lg hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Beli di Shopee</span>
                    </button>

                    {/* Tokopedia */}
                    <button
                      disabled={isPurchaseDisabled || !isTokopediaAvailable || !(selectedVariant?.tokopediaUrl || product.tokopediaLink)}
                      onClick={() => {
                        const url = selectedVariant?.tokopediaUrl || product.tokopediaLink;
                        if (url) handleMarketplaceClick('tokopedia', url);
                      }}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        (isPurchaseDisabled || !isTokopediaAvailable || !(selectedVariant?.tokopediaUrl || product.tokopediaLink))
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                          : 'bg-tokopedia hover:bg-tokopedia-hover text-white shadow-md shadow-green-500/10 hover:shadow-lg hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Beli di Tokopedia</span>
                    </button>

                    {/* Lazada */}
                    <button
                      disabled={isPurchaseDisabled || !isLazadaAvailable || !(selectedVariant?.lazadaUrl || product.lazadaLink)}
                      onClick={() => {
                        const url = selectedVariant?.lazadaUrl || product.lazadaLink;
                        if (url) handleMarketplaceClick('lazada', url);
                      }}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        (isPurchaseDisabled || !isLazadaAvailable || !(selectedVariant?.lazadaUrl || product.lazadaLink))
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                          : 'bg-lazada hover:bg-lazada-hover text-white shadow-md shadow-blue-900/10 hover:shadow-lg hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Beli di Lazada</span>
                    </button>

                    {/* TikTok */}
                    <button
                      disabled={isPurchaseDisabled || !isTiktokAvailable || !(selectedVariant?.tiktokUrl || product.tiktokLink)}
                      onClick={() => {
                        const url = selectedVariant?.tiktokUrl || product.tiktokLink;
                        if (url) handleMarketplaceClick('tiktok', url);
                      }}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        (isPurchaseDisabled || !isTiktokAvailable || !(selectedVariant?.tiktokUrl || product.tiktokLink))
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                          : 'bg-tiktok hover:bg-tiktok-hover text-white shadow-md shadow-black/10 hover:shadow-lg hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Beli di TikTok Shop</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: CUSTOMER TESTIMONIAL GRID */}
        <div className="bg-gradient-to-br from-blue-50/30 to-cream-50/20 rounded-3xl border border-blue-100/30 p-6 sm:p-8 lg:p-12">
          
          {/* Header Testimonials */}
          <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
            <div className="inline-flex p-2 rounded-2xl bg-pink-50 border border-pink-100 text-pink-500">
              <Smile className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Testimoni Teman Peluk
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Lebih dari ribuan boneka telah diadopsi dan menemani tidur nyenyak pemiliknya dengan aman.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-blue-50/50 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                    ))}
                  </div>
                  
                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-500 font-bold text-xs flex items-center justify-center">
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1">
                      <span>{rev.name}</span>
                      {rev.verified && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
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

      </div>
    </div>
  );
}
