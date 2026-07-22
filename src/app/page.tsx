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
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { CartCelebration } from "@/components/CartCelebration";
import { SiteFooter } from "@/components/SiteFooter";
import { GSAPInitializer } from "@/components/GSAPInitializer";

import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as LucideIcons from "lucide-react";
import TrustShowcase from "@/components/TrustShowcase";
import { Editable } from "./Editable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

interface TrustItem {
  image: string;
  title: string;
  description: string;
}

interface StoryContent {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  quote: string;
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
  heroTagline: string;
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
  const drawerCartIconRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [celebrateTrigger, setCelebrateTrigger] = useState(false);
  const [celebrateProductImage, setCelebrateProductImage] = useState<
    string | undefined
  >();

  // Hero Background Parallax
  useEffect(() => {
    if (!bgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: -12, // Slightly faster upward movement on scroll
        ease: "none",
        scrollTrigger: {
          trigger: bgRef.current?.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Hero Text Parallax
  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        y: -55, // Slightly faster floating text movement
        ease: "none",
        scrollTrigger: {
          trigger: textRef.current?.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Parallax for the Sewing Stitch Section Divider removed as requested
  useEffect(() => {
    // Divider stays static
  }, []);

  const handleCelebrate = (productImage?: string) => {
    setCelebrateProductImage(productImage);
    setCelebrateTrigger(false);
    requestAnimationFrame(() => setCelebrateTrigger(true));
  };

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTitle: "Temukan Boneka Kesukaanmu!",
    heroDescription:
      "Toko online Boneka Simoengil menyediakan aneka boneka flanel premium dalam berbagai ukuran (10cm, 15cm, 20cm). Sangat cocok untuk gantungan kunci, kado istimewa, pajangan estetik, hingga yang ukuran besar asyik untuk dipeluk si kecil!",
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
    heroTagline: "Boneka Flanel Premium, Jahit Tangan, Lembut & Aman",
    logoTextMain: "Simoengil",
    logoTextSub: "Plushie & Doll",
    logoIcon: "Smile",
    logoImageType: "icon",
    logoImageUrl: "",
    trustItems: [
      {
        image: "/images/3-Hand.jpeg",
        title: "100% Jahitan Tangan",
        description:
          "Setiap boneka kami dijahit dengan tangan, satu per satu, penuh ketelitian. Nggak ada mesin massal—cuma keterampilan dan kesabaran, supaya tiap jahitan kuat dan nggak gampang lepas.",
      },
      {
        image: "/images/4-Ruler.jpeg",
        title: "Detail Rapih & Kuat",
        description:
          "Ukuran boneka flanel kami memang mungil, tapi detailnya nggak sembarangan. Setiap pola diukur presisi supaya proporsinya pas dan jahitannya tetap kuat meski sering dipeluk.",
      },
      {
        image: "/images/1-Cardboard.jpeg",
        title: "Packing Aman",
        description:
          "Boneka diisi dakron premium yang empuk dan padat, lalu dikemas rapat dengan kardus tebal supaya aman sampai tujuan tanpa penyok, kotor, atau rusak di jalan.",
      },
      {
        image: "/images/2-Truck.jpeg",
        title: "Pengiriman Cepat",
        description:
          "Begitu pesanan selesai dijahit, langsung kami kirim secepat mungkin—supaya boneka baru kamu nggak lama-lama menunggu di perjalanan.",
      },
    ],
    story: {
      title: "Boneka Flanel yang Dibuat dengan Kasih Sayang",
      paragraph1:
        "Halo, saya ibu dari Simoengil. Boneka-boneka ini saya buat dengan tangan sendiri menggunakan kain flanel premium yang super lembut. Setiap boneka dijahit pelan-pelan agar rapi dan kuat.",
      paragraph2:
        "Saya paham betul seorang ibu ingin yang terbaik. Makanya saya hanya pakai bahan flanel berkualitas tinggi. Boneka ini tersedia dalam ukuran 10cm dan 15cm (imut & mungil, tidak untuk dipeluk), hingga ukuran 20cm yang nyaman dipeluk.",
      paragraph3:
        "Sangat cocok untuk kado ulang tahun, gantungan kunci, kado wisuda, atau sekadar teman bermain anak. Banyak pelanggan yang sudah membeli dan senang dengan hasilnya.",
      quote:
        "Setiap boneka dibuat pelan-pelan supaya bisa menemani anak dengan nyaman dan penuh kehangatan.",
    },
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

  const handleSettingsSave = async (key: string, value: any): Promise<void> => {
    // Optimistic UI update
    const newSettings = { ...siteSettings, [key]: value };
    setSiteSettings(newSettings);

    // Persist to localStorage as cache
    localStorage.setItem("simoengil_settings", JSON.stringify(newSettings));

    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ settings: newSettings })
        .eq("id", "homepage");

      if (error) throw error;
    } catch (err) {
      console.error("Failed to save settings:", err);
      // Silently fail — localStorage cache still works for the session
    }
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
      a: "Boneka flanel sebaiknya tidak dicuci agar bahannya tetap bagus.",
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

  // Safe derived story — guards against undefined if Supabase/localStorage
  // merge doesn't include the story field.
  const story: StoryContent = (siteSettings.story as StoryContent) ?? {
    title: "Boneka Flanel yang Dibuat dengan Kasih Sayang",
    paragraph1:
      "Halo, saya ibu dari Simoengil. Boneka-boneka ini saya buat dengan tangan sendiri menggunakan kain flanel premium yang super lembut. Setiap boneka dijahit pelan-pelan agar rapi dan kuat.",
    paragraph2:
      "Saya paham betul seorang ibu ingin yang terbaik. Makanya saya hanya pakai bahan flanel berkualitas tinggi. Boneka ini tersedia dalam ukuran 10cm dan 15cm (imut & mungil, tidak untuk dipeluk), hingga ukuran 20cm yang nyaman dipeluk.",
    paragraph3:
      "Sangat cocok untuk kado ulang tahun, gantungan kunci, kado wisuda, atau sekadar teman bermain anak. Banyak pelanggan yang sudah membeli dan senang dengan hasilnya.",
    quote:
      "Setiap boneka dibuat pelan-pelan supaya bisa menemani anak dengan nyaman dan penuh kehangatan.",
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-600 bg-transparent font-sans text-slate-800">
      <GSAPInitializer />

      {/* HEADER / NAVBAR */}

      <main className="flex-1 w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative z-0 w-full min-h-[100svh] pt-28 pb-16 flex flex-col justify-center">
          {/* Zoomed Out Background with Parallax Ref */}
          <div
            ref={bgRef}
            className="absolute inset-0 w-full h-[130%] top-0 bg-cover bg-[30%_35%] md:bg-center bg-no-repeat z-0 pointer-events-none"
            style={{ backgroundImage: "url('/images/hero.png')" }}
          />
          {/* Sunlight Beams from Window */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <svg
              viewBox="0 0 1920 1080"
              className="w-full h-full opacity-[0.35]"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="sun-beam-grad-1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FFF8D6" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#FFEAA7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFEAA7" stopOpacity="0" />
                </linearGradient>
                <filter id="blur-beam-std">
                  <feGaussianBlur stdDeviation="35" />
                </filter>
              </defs>
              {/* Main wide diagonal light beam directed towards the doll/nightstand area (left-center) */}
              <polygon
                points="0,80 320,0 1100,1080 0,1080"
                fill="url(#sun-beam-grad-1)"
                filter="url(#blur-beam-std)"
              />
              {/* Secondary sharper beam for realistic overlap */}
              <polygon
                points="80,0 260,0 950,1080 300,1080"
                fill="url(#sun-beam-grad-1)"
                filter="url(#blur-beam-std)"
                opacity="0.65"
              />
            </svg>
          </div>

          {/* Floating Dust Particles in the Sunbeam */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
            <div className="absolute left-[8%] top-[45%] w-1.5 h-1.5 bg-white/70 rounded-full blur-[0.4px] animate-dust-1" />
            <div
              className="absolute left-[14%] top-[55%] w-1 h-1 bg-white/80 rounded-full animate-dust-2"
              style={{ animationDelay: "1.5s" }}
            />
            <div
              className="absolute left-[6%] top-[65%] w-2 h-2 bg-yellow-100/60 rounded-full blur-[0.7px] animate-dust-3"
              style={{ animationDelay: "3.0s" }}
            />
            <div
              className="absolute left-[18%] top-[50%] w-1 h-1 bg-white/85 rounded-full animate-dust-1"
              style={{ animationDelay: "4.5s" }}
            />
            <div
              className="absolute left-[24%] top-[58%] w-1.5 h-1.5 bg-yellow-50/50 rounded-full blur-[0.4px] animate-dust-2"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute left-[10%] top-[35%] w-1 h-1 bg-white/90 rounded-full animate-dust-3"
              style={{ animationDelay: "2.0s" }}
            />
            <div
              className="absolute left-[16%] top-[40%] w-1.5 h-1.5 bg-white/60 rounded-full blur-[0.3px] animate-dust-1"
              style={{ animationDelay: "5.2s" }}
            />
            <div
              className="absolute left-[20%] top-[30%] w-2 h-2 bg-yellow-100/50 rounded-full blur-[0.8px] animate-dust-2"
              style={{ animationDelay: "3.7s" }}
            />
            <div
              className="absolute left-[28%] top-[48%] w-1 h-1 bg-white/75 rounded-full animate-dust-3"
              style={{ animationDelay: "6.0s" }}
            />
            <div
              className="absolute left-[26%] top-[56%] w-1.5 h-1.5 bg-yellow-50/50 rounded-full blur-[0.4px] animate-dust-1"
              style={{ animationDelay: "2.5s" }}
            />
            <div
              className="absolute left-[33%] top-[52%] w-1 h-1 bg-white/80 rounded-full animate-dust-2"
              style={{ animationDelay: "7.1s" }}
            />
            <div
              className="absolute left-[4%] top-[72%] w-1.5 h-1.5 bg-white/50 rounded-full blur-[0.4px] animate-dust-3"
              style={{ animationDelay: "1.2s" }}
            />
          </div>

          {/* Animated Butterflies */}
          {/* Butterfly 1 (Near Window/Left) */}
          <div
            className="absolute left-[20%] top-[40%] w-12 h-12 z-10 animate-fly-1 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#FF8FB1"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#FF8FB1"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="3" ry="18" fill="#4A3B32" />
              <circle cx="50" cy="33" r="4" fill="#4A3B32" />
              <path
                d="M49,30 Q43,18 36,22 M51,30 Q57,18 64,22"
                stroke="#4A3B32"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 2 (Near Bed/Right) */}
          <div
            className="absolute right-[25%] top-[25%] w-10 h-10 z-10 animate-fly-2 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#F8BBD0"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#F8BBD0"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.5" ry="16" fill="#4A3B32" />
              <circle cx="50" cy="35" r="3.5" fill="#4A3B32" />
              <path
                d="M49,32 Q43,20 36,24 M51,32 Q57,20 64,24"
                stroke="#4A3B32"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 3 (Soft Cyan - Middle Upper) */}
          <div
            className="absolute left-[45%] top-[15%] w-9 h-9 z-10 animate-fly-3 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#80DEEA"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#E0F7FA"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#80DEEA"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#E0F7FA"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.2" ry="15" fill="#4A3B32" />
              <circle cx="50" cy="36" r="3.2" fill="#4A3B32" />
              <path
                d="M49,33 Q43,21 36,25 M51,33 Q57,21 64,25"
                stroke="#4A3B32"
                strokeWidth="1.0"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 4 (Soft Gold - Center Right) */}
          <div
            className="absolute right-[45%] top-[40%] w-11 h-11 z-10 animate-fly-4 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#FFE082"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#FFF9C4"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#FFE082"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#FFF9C4"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.8" ry="17" fill="#4A3B32" />
              <circle cx="50" cy="34" r="3.8" fill="#4A3B32" />
              <path
                d="M49,31 Q43,19 36,23 M51,31 Q57,19 64,23"
                stroke="#4A3B32"
                strokeWidth="1.3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 5 (Soft Lavender - Left Upper) */}
          <div
            className="absolute left-[30%] top-[20%] w-8 h-8 z-10 animate-fly-5 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#CE93D8"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#F3E5F5"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#CE93D8"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#F3E5F5"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.0" ry="14" fill="#4A3B32" />
              <circle cx="50" cy="37" r="3.0" fill="#4A3B32" />
              <path
                d="M49,34 Q43,22 36,26 M51,34 Q57,22 64,26"
                stroke="#4A3B32"
                strokeWidth="0.9"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-end w-full z-20 mt-auto md:mt-0 pt-16 md:pt-0 pb-8 md:pb-0">
            {/* Hero Info Text Block — Safe Zone Card */}
            <div
              ref={textRef}
              className="w-full md:w-[55%] lg:w-[50%] text-center md:text-left space-y-4 md:space-y-6 relative z-10 flex flex-col items-center md:items-start bg-white/85 backdrop-blur-sm rounded-2xl p-5 md:p-8 shadow-lg shadow-black/5 border border-white/60"
            >
              {/* Pre-headline Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D48C70]/10 border border-[#D48C70]/20 text-[#D48C70] text-[10px] font-black uppercase tracking-[0.15em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D48C70] animate-pulse" />
                <span>Boneka Premium</span>
              </div>
              <Editable
                isAdmin={isAdmin}
                itemKey="heroTitle"
                initialValue={siteSettings.heroTitle}
                onSave={handleSettingsSave}
                as="h1"
                className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] tracking-tight leading-[1.1] gsap-hero-title"
              >
                {(value) => (
                  <span dangerouslySetInnerHTML={{ __html: value }} />
                )}
              </Editable>

              {/* Editable Tagline — hidden on mobile */}
              <Editable
                isAdmin={isAdmin}
                itemKey="heroTagline"
                initialValue={siteSettings.heroTagline}
                onSave={handleSettingsSave}
                as="p"
                className="hidden md:block text-sm md:text-base text-[#5A4F49] font-medium leading-relaxed max-w-md"
              />

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 pt-2 w-full gsap-hero-ctas">
                <div className="relative group inline-block w-full sm:w-auto">
                  {/* Floating Taekwondo Doll Hiding Behind */}
                  <div className="absolute -left-2 -top-6 w-16 h-16 sm:w-20 sm:h-20 z-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-10 group-hover:-translate-x-6 group-hover:-rotate-12 origin-bottom">
                    <div className="relative w-full h-full animate-peek group-hover:animate-none">
                      <img
                        src="/images/boneka3.png"
                        alt="Boneka Taekwondo"
                        onError={(e) => {
                          e.currentTarget.src = "/images/boneka3.png";
                        }}
                        className="w-full h-full object-contain drop-shadow-md brightness-95 sepia-[0.2]"
                      />
                      {/* Exclamation Mark */}
                      <div className="absolute top-0 right-2 sm:right-3 text-3xl sm:text-4xl font-black text-[#D48C70] drop-shadow-[0_2px_4px_rgba(212,140,112,0.5)] opacity-0 scale-50 transition-all duration-300 animate-peek-alert group-hover:animate-none group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-12 z-20">
                        !
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/products"
                    className="relative z-10 w-full sm:w-auto px-7 py-4.5 bg-[#D48C70] hover:bg-[#C27D62] text-white font-extrabold rounded-xl text-center shadow-lg shadow-[#D48C70]/30 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer btn-premium-hover"
                  >
                    <span>Pilih Boneka Favoritnya</span>
                    <span className="bg-white text-[#D48C70] w-6 h-6 rounded-md flex items-center justify-center font-black text-sm shrink-0">
                      &gt;
                    </span>
                  </Link>
                </div>

                <a
                  href="#tentang"
                  className="w-full sm:w-auto px-7 py-4 bg-white/90 hover:bg-white text-[#D48C70] border border-[#D48C70]/30 font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Tentang Simoengil
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND PROMISE SECTION (Text & Peach Background) */}
        <section className="relative z-10 w-full pt-24 md:pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="absolute top-[54px] md:top-[74px] bottom-0 left-0 right-0 bg-[#FCE6CB] -z-10" />
          {/* Creative Stitch & Felt Wave Divider (Made taller to allow downward parallax without revealing straight lines) */}
          <div
            ref={dividerRef}
            className="absolute top-0 left-0 right-0 w-full z-20 pointer-events-none"
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-[55px] md:h-[75px] block"
            >
              {/* Wavy Felt Fabric Layer */}
              <path
                d="M0,40 C50,20 100,20 150,40 C200,60 250,60 300,40 C350,20 400,20 450,40 C500,60 550,60 600,40 C650,20 700,20 750,40 C800,60 850,60 900,40 C950,20 1000,20 1050,40 C1100,60 1150,60 1200,40 L1200,120 L0,120 Z"
                fill="#FCE6CB"
              />
              {/* White Sewing Stitch Line (Embroidery Thread) */}
              <path
                d="M0,33 C50,13 100,13 150,33 C200,53 250,53 300,33 C350,13 400,13 450,33 C500,53 550,53 600,33 C650,13 700,13 750,33 C800,53 850,53 900,33 C950,13 1000,13 1050,33 C1100,53 1150,53 1200,33"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeDasharray="14 10"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </div>
          <Editable
            isAdmin={isAdmin}
            itemKey="whyTitle"
            initialValue={siteSettings.whyTitle}
            onSave={handleSettingsSave}
            as="h2"
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2A2320] leading-tight max-w-4xl mx-auto mb-6 tracking-tight drop-shadow-sm"
          />
          <Editable
            isAdmin={isAdmin}
            itemKey="heroDescription"
            initialValue={siteSettings.heroDescription}
            onSave={handleSettingsSave}
            as="p"
            className="font-sans text-sm md:text-base text-[#5A4F49] max-w-lg mx-auto leading-relaxed mb-10 text-center"
          />
          <Link
            href="/products"
            className="bg-[#D48C70] hover:bg-[#C27D62] text-white font-sans font-bold py-4 px-10 rounded-full shadow-lg shadow-[#D48C70]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Pilih Boneka Favoritnya
          </Link>
        </section>

        {/* TRUST SHOWCASE */}
        <TrustShowcase
          isAdmin={isAdmin}
          items={siteSettings.trustItems as TrustItem[]}
          onSave={(updatedItems) =>
            handleSettingsSave("trustItems", updatedItems)
          }
        />

        {/* =============================================
            CLOUD DIVIDER — Trust Badge → White Zone
        =============================================== */}
        <div
          className="relative z-10 w-full -mb-1 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            style={{ height: "clamp(70px, 10vw, 140px)" }}
          >
            {/* Cloud background base — peach (warna trust badge) */}
            <rect width="1440" height="140" fill="#FCE6CB" />
            {/* Fluffy cloud layer — awan putih mengalir ke zona putih */}
            <path
              d="
                M0,140 L0,95
                Q60,55 120,80
                Q150,92 180,75
                Q220,52 270,72
                Q300,85 330,68
                Q375,42 420,65
                Q455,82 490,62
                Q535,38 580,60
                Q615,76 650,58
                Q690,38 730,55
                Q770,72 810,52
                Q850,32 895,52
                Q930,68 965,50
                Q1005,30 1050,52
                Q1085,68 1120,50
                Q1165,28 1210,50
                Q1250,68 1290,52
                Q1340,30 1380,55
                Q1415,72 1440,60
                L1440,140 Z
              "
              fill="#ffffff"
            />
            {/* Second cloud puff layer for depth */}
            <path
              d="
                M0,140 L0,110
                Q40,90 80,105
                Q110,115 145,100
                Q180,85 215,100
                Q250,115 285,102
                Q320,88 360,104
                Q395,118 435,103
                Q475,87 515,102
                Q555,118 595,105
                Q635,90 675,106
                Q715,120 755,107
                Q795,92 835,108
                Q875,122 915,108
                Q955,93 995,109
                Q1035,123 1075,110
                Q1115,95 1155,110
                Q1195,124 1240,112
                Q1285,98 1330,112
                Q1380,124 1440,115
                L1440,140 Z
              "
              fill="#ffffff"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* =============================================
            WHITE ZONE — Tentang, Testimonial, FAQ
            Background putih bersih untuk kontras elegan
            dengan peach trust badge di atasnya
        =============================================== */}
        <div className="relative z-10 bg-white">
          {/* SECTION A: TENTANG SIMOENGIL (STORYTELLING) */}
          <section id="tentang" className="relative py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                {/* Story Image Section with Polaroid Vibe */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#D48C70]/10 rounded-full blur-xl" />
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#E8B37D]/10 rounded-full blur-2xl" />

                  <div className="relative bg-white p-4 pb-12 rounded-[2rem] shadow-xl border border-[#E8B37D]/20 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 max-w-[380px] w-full z-10">
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FCE6CB]">
                      <img
                        src="/images/detail_fabric.png"
                        alt="Bahan Premium Kain Simoengil"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-[#2A1F1A]/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-widest font-black py-1 px-3 rounded-full">
                        Premium Quality
                      </div>
                    </div>
                    <div className="mt-5 text-center font-serif text-[#2C2C2C] text-sm tracking-wide flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D48C70]" /> Kain
                      Lembut & Dacron Murni
                    </div>
                  </div>
                </div>

                {/* Story Text Section */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5F0] border border-[#D48C70]/30 text-[#D48C70] font-bold text-xs uppercase tracking-widest">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Cerita Simoengil</span>
                  </div>

                  <Editable
                    isAdmin={isAdmin}
                    itemKey="story.title"
                    initialValue={story.title}
                    onSave={(key, value) =>
                      handleSettingsSave("story", { ...story, title: value })
                    }
                    as="h2"
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2A1F1A] leading-tight gsap-section-title relative pb-3"
                  />
                  <span className="gsap-underline absolute bottom-0 left-0 bg-[#D48C70] h-[3px] w-0" />

                  <div
                    className="space-y-5 text-slate-600 text-sm sm:text-base leading-relaxed font-medium gsap-reveal"
                    data-effect="blur"
                  >
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.paragraph1"
                      initialValue={story.paragraph1}
                      onSave={(key, value) =>
                        handleSettingsSave("story", {
                          ...story,
                          paragraph1: value,
                        })
                      }
                      as="p"
                      className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
                    />
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.paragraph2"
                      initialValue={story.paragraph2}
                      onSave={(key, value) =>
                        handleSettingsSave("story", {
                          ...story,
                          paragraph2: value,
                        })
                      }
                      as="p"
                      className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
                    />
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.paragraph3"
                      initialValue={story.paragraph3}
                      onSave={(key, value) =>
                        handleSettingsSave("story", {
                          ...story,
                          paragraph3: value,
                        })
                      }
                      as="p"
                      className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
                    />
                  </div>

                  {/* Highlight Quote */}
                  <div
                    className="relative pl-6 border-l-4 border-[#D48C70] py-2 bg-[#FFF5F0]/60 rounded-r-2xl pr-4 gsap-reveal"
                    data-effect="fade-up"
                    data-delay="0.1"
                  >
                    <span className="absolute top-1 left-2 text-4xl text-[#D48C70]/30 leading-none font-serif">
                      &ldquo;
                    </span>
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.quote"
                      initialValue={story.quote}
                      onSave={(key, value) =>
                        handleSettingsSave("story", { ...story, quote: value })
                      }
                      as="p"
                      className="italic text-[#2A1F1A] font-serif text-sm sm:text-base leading-relaxed"
                    />
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

          {/* TESTIMONIALS SECTION */}
          <section className="relative py-20">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5F0] border border-[#D48C70]/25 text-[#D48C70] font-bold text-xs uppercase tracking-widest shadow-xs">
                  <Smile className="w-3.5 h-3.5 text-[#E8B37D]" />
                  <span>Wall of Love</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1F1A] leading-tight gsap-section-title relative inline-block pb-3">
                  Kisah Manis Boneka Simoengil
                  <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#D48C70] h-[3px] w-0"></span>
                </h2>
                <p
                  className="text-slate-500 text-sm font-medium leading-relaxed gsap-reveal"
                  data-effect="blur"
                >
                  Ribuan boneka handmade kami telah menjadi kado terindah &
                  membawa senyuman di berbagai rumah.
                </p>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 md:gap-8 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                {/* Testimonial 1 */}
                <div
                  className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#E8B37D]/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                  data-effect="fade-up"
                  data-delay="0.1"
                >
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                      &quot;Bulunya halus banget rasfur premium, jahitannya
                      sangat rapi dan tebal. Isian dacronnya padat tapi tetap
                      empuk banget dipeluk. Sangat rekomended buat kado
                      anak-anak!&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#D48C70] font-bold text-xs flex items-center justify-center border border-[#E8B37D]/20 shrink-0">
                      RN
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                        <span>Ratih Ningsih</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        12 Mei 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div
                  className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#E8B37D]/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                  data-effect="fade-up"
                  data-delay="0.2"
                >
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
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
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#D48C70] font-bold text-xs flex items-center justify-center border border-[#E8B37D]/20 shrink-0">
                      BS
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                        <span>Budi Santoso</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        04 Mei 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div
                  className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#E8B37D]/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                  data-effect="fade-up"
                  data-delay="0.3"
                >
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                      &quot;Anak saya senang sekali dengan boneka ukuran 20cm
                      ini, pas buat dipeluk saat tidur. Bulunya tidak mudah
                      rontok jadi aman untuk balita. Kemarin dicuci mesin tetap
                      mengembang bagus!&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#D48C70] font-bold text-xs flex items-center justify-center border border-[#E8B37D]/20 shrink-0">
                      SR
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                        <span>Siti Rahma</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        28 April 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section
            id="faq"
            className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-28 pt-4"
          >
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF5F0] border border-[#E8B37D]/25 text-[#D48C70] mb-2 shadow-xs">
                <HelpCircle className="w-5 h-5 text-[#D48C70]" />
              </div>
              <h2 className="font-serif text-3xl text-[#2A1F1A] leading-tight gsap-section-title relative inline-block pb-3">
                Pertanyaan Populer (FAQ)
                <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#D48C70] h-[3px] w-0"></span>
              </h2>
              <p
                className="text-slate-500 text-xs sm:text-sm font-medium gsap-reveal"
                data-effect="blur"
              >
                Informasi lengkap seputar kualitas boneka, dan pengemasan
                pesanan.
              </p>
            </div>

            {/* FAQ Accordion list */}
            <div className="space-y-4 gsap-reveal" data-effect="fade-up">
              {faqs.map((faq, idx) => {
                const isOpen = faqOpenIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Header question */}
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#2C2C2C] text-sm sm:text-base cursor-pointer hover:bg-[#FFF5F0]/60"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#D48C70]" : ""}`}
                      />
                    </button>

                    {/* Answer body */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen
                          ? "max-h-96 opacity-100 border-t border-slate-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="p-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-[#FFF8F5]/50">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        {/* END WHITE ZONE */}

        {/* FOOTER */}
        <SiteFooter />

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
