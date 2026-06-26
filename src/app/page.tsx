"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  ShoppingCart,
  ChevronDown,
  Gift,
  HeartHandshake,
  Star,
} from "lucide-react";
import { Product, ProductVariant, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import FallingBoxesPhysics from "@/components/FallingBoxesPhysics";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { CartCelebration } from "@/components/CartCelebration";
import { GSAPInitializer } from "@/components/GSAPInitializer";
import Hero3DBoneka from "@/components/Hero3DBoneka";

import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as LucideIcons from "lucide-react";

const DynamicIcon = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
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
  logoImageType: "icon" | "image";
  logoImageUrl: string;
  [key: string]: unknown;
}

export default function Home() {
  // State
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<import("@/data/products").CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("terbaru");
  const heroTiltRef = useRef<HTMLDivElement>(null);
  const drawerCartIconRef = useRef<HTMLDivElement | null>(null);
  const [celebrateTrigger, setCelebrateTrigger] = useState(false);
  const [celebrateProductImage, setCelebrateProductImage] = useState<string | undefined>();

  const handleCelebrate = (productImage?: string) => {
    setCelebrateProductImage(productImage);
    setCelebrateTrigger(false);
    requestAnimationFrame(() => setCelebrateTrigger(true));
  };

  // Global mouse move for 3D hero tilt
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      if (!heroTiltRef.current) return;
      
      const rect = heroTiltRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center, dampened to make the effect subtle
      const x = (e.clientX - centerX) / 40;
      const y = -(e.clientY - centerY) / 40;
      
      // Limit the maximum rotation to prevent extreme angles
      const maxRotation = 15;
      const clampedX = Math.max(-maxRotation, Math.min(maxRotation, x));
      const clampedY = Math.max(-maxRotation, Math.min(maxRotation, y));
      
      heroTiltRef.current.style.transform = `rotateY(${clampedX}deg) rotateX(${clampedY}deg)`;
    };

    const handleGlobalMouseLeave = () => {
      if (heroTiltRef.current) {
        heroTiltRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseleave', handleGlobalMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, []);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTitle: "Temukan Teman Peluk Pertamamu!",
    heroDescription:
      "Toko online Boneka Simoengil menyediakan aneka plushie & boneka super lembut berkualitas tinggi. Terbuat dari 100% premium dacron grade A, hypoallergenic, aman untuk anak-anak, dan bisa dicuci sesering mungkin tanpa khawatir kempis!",
    whyTitle: "Kenapa Memilih Boneka Simoengil?",
    whyFeatures: [
      {
        icon: "ShieldCheck",
        title: "100% Dacron Grade A",
        desc: "Isian silikon dacron super murni tanpa campuran limbah garmen. Memastikan keempukan tahan bertahun-tahun dan tidak gampang kempes.",
      },
      {
        icon: "RefreshCw",
        title: "Bisa Dicuci (Washable)",
        desc: "Mudah dibersihkan! Cukup dicuci dengan tangan atau mesin cuci (putaran halus). Dacron akan mengembang kembali begitu kering sempurna.",
      },
      {
        icon: "Smile",
        title: "Aman untuk Bayi",
        desc: "Kain luar bulu yelvo/spandex hypoallergenic berbulu lembut dan tidak mudah rontok. Lulus uji kualitas aman bagi pernapasan balita.",
      },
    ],
    heroImage1: "/images/plushie_teddy.png",
    heroImage2: "/images/plushie_bunny.png",
    heroBadge1Icon: "🌟",
    heroBadge1Text: "Terlembut",
    heroBadge2Icon: "❤️",
    heroBadge2Text: "Anti Alergi",
    logoTextMain: "Simoengil",
    logoTextSub: "Plushie & Doll",
    logoIcon: "Smile",
    logoImageType: "icon",
    logoImageUrl: "",
  });

  // Load wishlist from localStorage on mount & Fetch Supabase products & Check Admin Auth
  useEffect(() => {
    const savedCart = localStorage.getItem("simoengil_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");
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
              shopeeLink: item.shopee_link || "",
              shopeeAvailable:
                specs.shopeeAvailable !== undefined
                  ? specs.shopeeAvailable
                  : true,
              specifications: {
                material: specs.material || "100% Premium Dacron & Kain Rasfur",
                size: specs.size || "Standard",
                washing:
                  specs.washing || "Bisa dicuci dengan tangan atau mesin cuci",
                safeForKids:
                  specs.safeForKids !== undefined ? specs.safeForKids : true,
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable:
                  specs.shopeeAvailable !== undefined
                    ? specs.shopeeAvailable
                    : true,
                features: specs.features || [],
                images: specs.images || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types: specs.types || [],
                sizes: specs.sizes || [],
              },
              variants: (item.variants || []).map(
                (v: Partial<ProductVariant>) => ({
                  ...v,
                  shopeeAvailable:
                    v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
                }),
              ),
            };
          });
          setProductsList(mappedData);
        } else {
          const localMockStr = localStorage.getItem("simoengil_mock_products");
          if (localMockStr) {
            setProductsList(JSON.parse(localMockStr));
          }
        }
      } catch (err) {
        console.warn(
          "Supabase fetch failed, falling back to local products list:",
          err,
        );
        const localMockStr = localStorage.getItem("simoengil_mock_products");
        if (localMockStr) {
          setProductsList(JSON.parse(localMockStr));
        }
      }
    };

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          // Only redirect to admin panel if the role is admin
          if (session.user?.user_metadata?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.warn("Auth check skipped");
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
          if (session.user?.user_metadata?.role === "admin") {
            setIsAdmin(true);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      },
    );

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "homepage")
          .single();
        if (!error && data) {
          setSiteSettings((prev) => ({
            ...prev,
            ...(data.settings || {}),
          }));
        }
      } catch (err) {
        // Silently catch error, we will fallback to localStorage below
        console.log("Using local settings fallback");
      }

      // Always load local defaults if available as fallback or overlay
      const local = localStorage.getItem("simoengil_settings");
      if (local) {
        try {
          const settings = JSON.parse(local);
          setSiteSettings((prev) => ({
            ...prev,
            ...settings,
          }));
        } catch (e) {
          console.warn("Failed to parse local settings", e);
        }
      }
    };

    fetchProducts();
    fetchSettings();

    // Check URL parameters for auth redirect
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth") === "true") {
        setIsAuthModalOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");
        url.searchParams.delete("required");
        window.history.replaceState({}, "", url.toString());
      }
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Logic handled in the authListener above
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    let updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("simoengil_cart", JSON.stringify(updatedCart));
  };

  const handleAddToCart = (
    product: Product,
    variantSize?: string,
    variantType?: string,
  ) => {
    const cartItemId = `${product.id}-${variantSize || "default"}-${variantType || "default"}`;
    const existingItem = cart.find((item) => item.cartItemId === cartItemId);

    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      let price = product.price;
      const sizes = product.specifications?.sizes || [];
      const types = product.specifications?.types || [];

      const sizeObj = sizes.find((s) => s.name === variantSize);
      const typeObj = types.find((t) => t.name === variantType);

      if (sizeObj && sizeObj.extraPrice) price += sizeObj.extraPrice;
      if (typeObj && typeObj.extraPrice) price += typeObj.extraPrice;

      updatedCart = [
        ...cart,
        {
          ...product,
          cartItemId,
          selectedVariantSize: variantSize,
          selectedVariantType: variantType,
          quantity: 1,
          selectedPrice: price,
        },
      ];
    }

    setCart(updatedCart);
    localStorage.setItem("simoengil_cart", JSON.stringify(updatedCart));
    setIsWishlistOpen(true);
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updatedCart = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem("simoengil_cart", JSON.stringify(updatedCart));
  };

  // Filter products using dynamic productsList
  const filteredProducts = productsList
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "termurah") return a.price - b.price;
      if (sortBy === "termahal") return b.price - a.price;
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
    const catalogSection = document.getElementById("katalog");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Categories list
  const categories = [
    "Semua",
    ...Array.from(new Set(productsList.map((p) => p.category).filter(Boolean))),
  ];

  // FAQs
  const faqs = [
    {
      q: "Apakah boneka flanel Simoengil aman untuk bayi dan balita?",
      a: "Sangat aman, Bu. Boneka kami terbuat dari kain flanel premium yang lembut dan hypoallergenic (tidak mudah menyebabkan alergi). Jahitannya rapi, tidak ada bagian kecil yang mudah lepas, sehingga aman untuk anak kecil dan bayi.",
    },
    {
      q: "Boneka flanel boleh dicuci tidak?",
      a: "Boneka flanel sebaiknya **tidak dicuci dengan mesin cuci** agar bulu dan bentuknya tetap bagus. Saran kami: cukup lap dengan kain bersih yang dibasahi air hangat kuku + sedikit sabun bayi. Jika kotor sekali, bisa dibawa ke laundry dry clean. Hindari merendam lama agar tidak merusak kain flanel.",
    },
    {
      q: "Apakah bisa pesan boneka untuk kado wisuda dengan custom nama?",
      a: "Tidak bisa, untuk pesanan custom tidak dilakukan di website, jika ingin dilakukan custom silahkan lakukan pembelian di Shopee",
    },
    {
      q: "Berapa lama proses packing dan pengiriman?",
      a: "Kami packing dan kirim setiap hari. Pesanan yang masuk sebelum jam 15.00 WIB biasanya dikirim di hari yang sama. Untuk Jabodetabek tersedia pengiriman sameday/instan melalui Shopee.",
    },
    {
      q: "Apakah ada garansi jika boneka rusak atau cacat?",
      a: "Ada garansi kualitas. Jika dalam 7 hari setelah terima ada cacat produksi (jahitan lepas, bahan robek, dll), silakan hubungi kami via WhatsApp untuk proses penggantian atau pengembalian.",
    },
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
        {/* HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          <FallingBoxesPhysics />
          
          {/* Hero Info */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-[#FFB6C8]/30 text-[#FF8FB1] font-bold text-xs uppercase tracking-widest shadow-xs hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B37D]" />
              <span>Boneka Flanel Premium Lokal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C2C2C] tracking-tight leading-[1.15] font-heading gsap-hero-title">
              Boneka Flanel Lembut <br />
              <span className="text-[#FF8FB1]">
                Buat Si Kecil & Kado Spesial
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium gsap-hero-subtitle">
              Boneka flanel super lembut, handmade dengan penuh sayang. Cocok
              untuk pelukan anak, kado ulang tahun, wisuda, atau hadiah untuk
              orang tersayang.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#2C2C2C]">
                <Smile className="w-5 h-5 text-[#FF8FB1]" />
                <span>Super Lembut seperti Pelukan</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#2C2C2C]">
                <Heart className="w-5 h-5 text-[#FF8FB1]" />
                <span>Aman & Nyaman untuk Anak</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#2C2C2C]">
                <LucideIcons.Scissors className="w-5 h-5 text-[#E8B37D]" />
                <span>Handmade dengan Teliti</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#2C2C2C]">
                <Gift className="w-5 h-5 text-[#FFB6C8]" />
                <span>Cocok untuk Kado</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 gsap-hero-ctas">
              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-4 bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white font-extrabold rounded-2xl text-center shadow-lg shadow-[#FF8FB1]/20 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer btn-premium-hover"
              >
                Lihat Koleksi Boneka
              </Link>

              <a
                href="#tentang"
                className="w-full sm:w-auto px-8 py-4 border-2 border-[#FFB6C8]/40 text-[#2C2C2C] hover:text-[#FF8FB1] hover:border-[#FF8FB1] font-bold rounded-2xl hover:bg-white/40 transition-all duration-300 text-center cursor-pointer btn-premium-hover"
              >
                Tentang Simoengil
              </a>
            </div>
          </div>

          <div
            className="w-full lg:w-1/2 flex items-center justify-center relative px-6 md:px-12 mt-8 lg:mt-0 perspective-1000"
          >
            <div
              className="relative w-full max-w-[480px] aspect-square flex items-center justify-center"
            >
              <div
                ref={heroTiltRef}
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `rotateY(0deg) rotateX(0deg)`,
                }}
              >
                {/* Glowing Pink and Gold Circles Background */}
                <div className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-[#FFF5F0] via-[#FFF0F3] to-[#FFFDF0] shadow-[0_20px_60px_-15px_rgba(255,182,200,0.45)] border-4 border-white z-0 animate-pulse-glow" />
                <div
                  className="absolute w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-[#FFB6C8]/20 to-[#E8B37D]/20 blur-xl z-0 animate-pulse-glow"
                  style={{ animationDelay: "1s" }}
                />

                {/* Main Teddy Plushie */}
                <Hero3DBoneka />

              {/* Floating Badge Left */}
              <div className="absolute top-8 -left-2 bg-white/95 backdrop-blur-md border border-[#FFB6C8]/30 text-[#2C2C2C] text-xs font-bold py-2.5 px-4 rounded-2xl shadow-md rotate-3 flex items-center gap-2 z-20 hover:scale-105 transition-transform duration-300">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>100% Handmade Lokal</span>
              </div>

              {/* Floating Badge Right */}
              <div className="absolute bottom-20 -right-4 bg-white/95 backdrop-blur-md border border-[#E8B37D]/40 text-[#2C2C2C] text-xs font-bold py-2.5 px-4 rounded-2xl shadow-md -rotate-3 flex items-center gap-2.5 z-20 hover:scale-105 transition-transform duration-300">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-[#FF8FB1]">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>Aman & Anti-Alergi</span>
              </div>

              {/* Secondary smaller floating plushie (Bunny) */}
              <div className="absolute bottom-0 left-0 w-36 h-36 flex items-center justify-center animate-float-slow z-20 drop-shadow-lg">
                <img
                  src="/images/boneka2.png"
                  alt="Mini Bunny Plushie"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* TRUST BADGES BAR */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(255,143,177,0.15)] transition-all duration-500 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFF5F0] to-white group-hover:from-[#FFE4EC] group-hover:to-[#FFF5F0] transition-colors flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/30 group-hover:border-[#FF8FB1]/50 group-hover:scale-110 duration-500 shadow-sm">
                <LucideIcons.Cloud className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="font-black text-[#2C2C2C] group-hover:text-[#FF8FB1] transition-colors text-[10px] sm:text-xs uppercase tracking-widest leading-snug">
                100% Jahitan Tangan
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(255,143,177,0.15)] transition-all duration-500 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFF5F0] to-white group-hover:from-[#FFE4EC] group-hover:to-[#FFF5F0] transition-colors flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/30 group-hover:border-[#FF8FB1]/50 group-hover:scale-110 duration-500 shadow-sm">
                <LucideIcons.ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="font-black text-[#2C2C2C] group-hover:text-[#FF8FB1] transition-colors text-[10px] sm:text-xs uppercase tracking-widest leading-snug">
                Detail rapih & kuat
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(255,143,177,0.15)] transition-all duration-500 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFF5F0] to-white group-hover:from-[#FFE4EC] group-hover:to-[#FFF5F0] transition-colors flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/30 group-hover:border-[#FF8FB1]/50 group-hover:scale-110 duration-500 shadow-sm">
                <LucideIcons.Droplets className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="font-black text-[#2C2C2C] group-hover:text-[#FF8FB1] transition-colors text-[10px] sm:text-xs uppercase tracking-widest leading-snug">
                Packing aman
              </span>
            </div>

            {/* Card 4 */}
            <div className="bg-white/50 hover:bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(255,143,177,0.15)] transition-all duration-500 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFF5F0] to-white group-hover:from-[#FFE4EC] group-hover:to-[#FFF5F0] transition-colors flex items-center justify-center text-[#FF8FB1] shrink-0 border border-[#FFB6C8]/30 group-hover:border-[#FF8FB1]/50 group-hover:scale-110 duration-500 shadow-sm">
                <LucideIcons.Truck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="font-black text-[#2C2C2C] group-hover:text-[#FF8FB1] transition-colors text-[10px] sm:text-xs uppercase tracking-widest leading-snug">
                Pengiriman Cepat
              </span>
            </div>
          </div>
        </div>

        {/* SECTION A: TENTANG SIMOENGIL (STORYTELLING) */}
        <section
          id="tentang"
          className="relative z-10 py-20 bg-gradient-to-b from-transparent via-[#FFF5F0]/60 to-transparent"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
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
                  <div className="mt-5 text-center font-heading font-black text-[#2C2C2C] text-sm tracking-wide flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF8FB1]" /> Kain Lembut
                    & Dacron Murni
                  </div>
                </div>
              </div>

              {/* Story Text Section */}
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#E8B37D]/30 text-[#E8B37D] font-bold text-xs uppercase tracking-widest">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Cerita Simoengil</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C2C2C] tracking-tight leading-tight font-heading gsap-section-title relative inline-block pb-3">
                  Boneka Flanel yang Dibuat dengan Kasih Sayang
                  <span className="gsap-underline absolute bottom-0 left-0 bg-[#FF8FB1] h-[3px] w-0"></span>
                </h2>

                <div
                  className="space-y-5 text-slate-600 text-sm sm:text-base leading-relaxed font-medium gsap-reveal"
                  data-effect="blur"
                >
                  <p>
                    Halo, saya ibu dari Simoengil. Boneka-boneka ini saya buat
                    dengan tangan sendiri menggunakan kain flanel premium yang
                    super lembut. Setiap boneka dijahit pelan-pelan agar rapi
                    dan kuat.
                  </p>
                  <p>
                    Saya paham betul seorang ibu ingin yang terbaik untuk
                    anaknya. Makanya saya hanya pakai bahan flanel berkualitas
                    tinggi yang aman dan nyaman dipeluk seharian.
                  </p>
                  <p>
                    Cocok untuk anak kecil, kado ulang tahun, kado wisuda, atau
                    sebagai teman peluk saat anak sedang sedih. Banyak ibu-ibu
                    yang sudah membeli dan senang dengan hasilnya.
                  </p>
                </div>

                {/* Highlight Quote */}
                <div
                  className="relative pl-6 border-l-4 border-[#FF8FB1] py-2 bg-white/40 rounded-r-2xl pr-4 gsap-reveal"
                  data-effect="fade-up"
                  data-delay="0.1"
                >
                  <span className="absolute top-1 left-2 text-4xl text-[#FFB6C8]/40 leading-none font-serif">
                    &ldquo;
                  </span>
                  <p className="italic text-[#2C2C2C] font-extrabold text-sm sm:text-base leading-relaxed">
                    “Setiap boneka dibuat pelan-pelan supaya bisa menemani anak
                    dengan nyaman dan penuh kehangatan.”
                  </p>
                </div>
              </div>
            </div>
          </div>
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

        {/* TESTIMONIALS SECTION (Zielabs Premium Quote Style) */}
        <section className="relative z-10 py-20 bg-gradient-to-b from-transparent via-[#FFF5F0]/40 to-transparent">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FFB6C8]/30 text-[#FF8FB1] font-bold text-xs uppercase tracking-widest shadow-xs">
                <Smile className="w-3.5 h-3.5 text-[#E8B37D]" />
                <span>Wall of Love</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#2C2C2C] tracking-tight font-heading gsap-section-title relative inline-block pb-3">
                Kisah Teman Peluk Simoengil
                <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FF8FB1] h-[3px] w-0"></span>
              </h2>
              <p
                className="text-slate-500 text-sm font-medium leading-relaxed gsap-reveal"
                data-effect="blur"
              >
                Ribuan boneka handmade kami telah menemani tidur nyenyak &
                membawa kebahagiaan di berbagai rumah.
              </p>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 md:gap-8 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {/* Testimonial 1 */}
              <div
                className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#FFB6C8]/20 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(255,182,200,0.08)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                data-effect="fade-up"
                data-delay="0.1"
              >
                <div className="space-y-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                    &quot;Bulunya halus banget rasfur premium, jahitannya sangat
                    rapi dan tebal. Isian dacronnya padat tapi tetap empuk
                    banget dipeluk. Sangat rekomended buat kado anak-anak!&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-slate-100/60">
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20 shrink-0">
                    RN
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                      <span>Ratih Ningsih</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                        ✓ Verified
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">12 Mei 2026</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div
                className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#FFB6C8]/20 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(255,182,200,0.08)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                data-effect="fade-up"
                data-delay="0.2"
              >
                <div className="space-y-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                    &quot;Beli untuk kado wisuda pacar, respon admin cepat and
                    dapet selempang kustom nama wisuda gratis. Packingnya rapi
                    menggunakan box cantik dan pita pink manis. Worth the
                    price!&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-slate-100/60">
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20 shrink-0">
                    BS
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                      <span>Budi Santoso</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                        ✓ Verified
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">04 Mei 2026</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div
                className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#FFB6C8]/20 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(255,182,200,0.08)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                data-effect="fade-up"
                data-delay="0.3"
              >
                <div className="space-y-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                    &quot;Anak saya senang sekali dengan boneka ini, dipeluk
                    terus setiap tidur. Bulunya tidak mudah rontok jadi aman
                    untuk balita. Kemarin dicuci mesin tetap mengembang
                    bagus!&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-slate-100/60">
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF8FB1] font-bold text-xs flex items-center justify-center border border-[#FFB6C8]/20 shrink-0">
                    SR
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                      <span>Siti Rahma</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                        ✓ Verified
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">28 April 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section
          id="faq"
          className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 mb-28"
        >
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF5F0] border border-[#FFB6C8]/30 text-[#FF8FB1] mb-2 shadow-xs">
              <HelpCircle className="w-5 h-5 text-[#E8B37D]" />
            </div>
            <h2 className="text-3xl font-black text-[#2C2C2C] tracking-tight font-heading gsap-section-title relative inline-block pb-3">
              Pertanyaan Populer (FAQ)
              <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FF8FB1] h-[3px] w-0"></span>
            </h2>
            <p
              className="text-slate-500 text-xs sm:text-sm font-medium gsap-reveal"
              data-effect="blur"
            >
              Informasi lengkap seputar kualitas boneka, dan pengemasan pesanan.
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
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#FF8FB1]" : ""}`}
                    />
                  </button>

                  {/* Answer body */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen
                        ? "max-h-96 opacity-100 border-t border-[#FFB6C8]/10"
                        : "max-h-0 opacity-0"
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
          key={selectedProduct?.id || "no-product"}
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onAddToCart={handleAddToCart}
          onCelebrate={handleCelebrate}
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
          drawerCartIconRef={drawerCartIconRef}
        />

        <CartCelebration
          trigger={celebrateTrigger}
          productImage={celebrateProductImage}
          cartIconRef={drawerCartIconRef}
          onComplete={() => setCelebrateTrigger(false)}
        />

        {/* TRACKING MODAL */}
        <OrderTrackingModal
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />

        {/* AUTH MODAL */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </main>
    </div>
  );
}
