"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ShieldCheck,
  User,
} from "lucide-react";
import { PRODUCTS, Product, type CartItem } from "@/data/products";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { GSAPInitializer } from "@/components/GSAPInitializer";
import AuthModal from "@/components/AuthModal";

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
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Zoom and Accordion States
  const [zoomOrigin, setZoomOrigin] = useState<string>("center");
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [photoTilt, setPhotoTilt] = useState({ x: 0, y: 0 });
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "deskripsi",
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

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
    setZoomOrigin("center");
    setPhotoTilt({ x: 0, y: 0 });
  };

  const handleAccordionToggle = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // Load product from Supabase & All Products & Check Admin Session & Wishlist
  useEffect(() => {
    // 1. Cart from localStorage
    const loadCart = () => {
      const savedCart = localStorage.getItem("simoengil_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to load cart", e);
        }
      }
    };
    loadCart();

    window.addEventListener("cart_updated", loadCart);

    // Force scroll to top on mount
    window.scrollTo(0, 0);

    // 2. Fetch specific product
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
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

            description: data.description,
            rating: Number(data.rating || 5.0),
            reviewsCount: Number(data.reviews_count || 0),
            shopeeLink: data.shopee_link || "",
            shopeePrice: specs.shopeePrice || data.shopeePrice || undefined,
            shopeeAvailable:
              specs.shopeeAvailable !== undefined
                ? specs.shopeeAvailable
                : true,
            images: specs.images || data.images || [],
            specifications: {
              material: specs.material || "100% Premium Dacron & Kain Rasfur",
              size: specs.size || "Standard",
              washing: specs.washing || "Bisa dicuci mesin",
              safeForKids:
                specs.safeForKids !== undefined ? specs.safeForKids : true,
              shopeePrice: specs.shopeePrice || undefined,
              shopeeAvailable:
                specs.shopeeAvailable !== undefined
                  ? specs.shopeeAvailable
                  : true,
              images: specs.images || [],
              features: specs.features || [],
              soldCount: specs.soldCount || 0,
              testimonials: specs.testimonials || [],
              types:
                specs.types ||
                (data.variants
                  ? Array.from(
                      new Set(
                        data.variants.map((v: any) => v.type).filter(Boolean),
                      ),
                    ).map((t) => ({ name: t as string, extraPrice: 0 }))
                  : undefined),
              sizes:
                specs.sizes ||
                (data.variants
                  ? Array.from(
                      new Set(
                        data.variants.map((v: any) => v.size).filter(Boolean),
                      ),
                    ).map((s) => ({ name: s as string, extraPrice: 0 }))
                  : undefined),
            },
            variants: (data.variants || []).map((v: any) => ({
              ...v,
              shopeeAvailable:
                v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              tokopediaAvailable:
                v.tokopediaAvailable !== undefined
                  ? v.tokopediaAvailable
                  : true,
              lazadaAvailable:
                v.lazadaAvailable !== undefined ? v.lazadaAvailable : true,
              tiktokAvailable:
                v.tiktokAvailable !== undefined ? v.tiktokAvailable : true,
            })),
          };
          setProduct(mappedProduct);
          setActiveImage(mappedProduct.image);
        } else {
          const localMockStr = localStorage.getItem("simoengil_mock_products");
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
        console.warn(
          "Failed to fetch product from Supabase, falling back to local list:",
          err,
        );
        const localMockStr = localStorage.getItem("simoengil_mock_products");
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
              shopeePrice: specs.shopeePrice || item.shopeePrice || undefined,
              shopeeAvailable:
                specs.shopeeAvailable !== undefined
                  ? specs.shopeeAvailable
                  : true,
              specifications: {
                material: specs.material || "100% Premium Dacron & Kain Rasfur",
                size: specs.size || "Standard",
                washing: specs.washing || "Bisa dicuci mesin",
                safeForKids:
                  specs.safeForKids !== undefined ? specs.safeForKids : true,
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable:
                  specs.shopeeAvailable !== undefined
                    ? specs.shopeeAvailable
                    : true,
                images: specs.images || [],
                features: specs.features || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types:
                  specs.types ||
                  (item.variants
                    ? Array.from(
                        new Set(
                          item.variants.map((v: any) => v.type).filter(Boolean),
                        ),
                      ).map((t) => ({ name: t as string, extraPrice: 0 }))
                    : undefined),
                sizes:
                  specs.sizes ||
                  (item.variants
                    ? Array.from(
                        new Set(
                          item.variants.map((v: any) => v.size).filter(Boolean),
                        ),
                      ).map((s) => ({ name: s as string, extraPrice: 0 }))
                    : undefined),
              },
              variants: (item.variants || []).map((v: any) => ({
                ...v,
                shopeeAvailable:
                  v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              })),
            };
          });
          setAllProducts(mappedData);
        } else {
          const localMockStr = localStorage.getItem("simoengil_mock_products");
          if (localMockStr) {
            setAllProducts(JSON.parse(localMockStr));
          } else {
            setAllProducts(PRODUCTS);
          }
        }
      } catch (err) {
        console.warn(
          "Failed to fetch all products, using local fallback:",
          err,
        );
        const localMockStr = localStorage.getItem("simoengil_mock_products");
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAdmin(session?.user?.user_metadata?.role === "admin");
        setUser(session?.user ?? null);
      } catch (err) {
        console.warn("Could not retrieve auth session:", err);
      }
    };

    checkAdminSession();
    fetchProduct();
    fetchAllProducts();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.user_metadata?.role === "admin");
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cart_updated", loadCart);
    };
  }, [id]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FFB6C8]/30 border-t-[#FF8FB1] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Mempersiapkan kelembutan boneka...
          </p>
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
            <h1 className="text-2xl font-black text-[#2C2C2C] font-heading">
              Teman Peluk Tidak Ditemukan
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Maaf, boneka yang Anda cari mungkin sudah diadopsi oleh orang lain
              atau sedang istirahat di gudang kami.
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
  const uniqueTypes = productTypes.map((t) => t.name);
  const uniqueSizes = productSizes.map((s) => s.name);

  const hasTypes = uniqueTypes.length > 0;
  const hasSizes = uniqueSizes.length > 0;

  const selectedTypeObj = productTypes.find((t) => t.name === selectedType);
  const selectedSizeObj = productSizes.find((s) => s.name === selectedSize);

  const typeExtraPrice = selectedTypeObj?.extraPrice || 0;
  const sizeExtraPrice = selectedSizeObj?.extraPrice || 0;
  const currentPrice = product.price + typeExtraPrice + sizeExtraPrice;

  const isTypeSelected = !hasTypes || selectedType !== null;
  const isSizeSelected = !hasSizes || selectedSize !== null;
  const isPurchaseDisabled = !isTypeSelected || !isSizeSelected;

  const maxTypeExtra =
    productTypes.length > 0
      ? Math.max(...productTypes.map((t) => t.extraPrice || 0))
      : 0;
  const maxSizeExtra =
    productSizes.length > 0
      ? Math.max(...productSizes.map((s) => s.extraPrice || 0))
      : 0;

  const minPrice = product.price;
  const maxPrice = product.price + maxTypeExtra + maxSizeExtra;

  // Shopee availability logic (simplified for now to product level)
  const isShopeeAvailable =
    product.specifications?.shopeeAvailable !== false &&
    product.shopeeAvailable !== false;

  // Gallery images list (Main product photo + additional images)
  const galleryImages = [
    product.image,
    ...(product.specifications?.images || product.images || []),
  ].filter(Boolean);

  // Format IDR Price
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getMarketplacePrice = (platform: "shopee") => {
    let platPrices: number[] = [];
    if (platform === "shopee" && isShopeeAvailable) {
      if (product.specifications?.shopeePrice) {
        platPrices.push(product.specifications.shopeePrice);
      } else if (product.shopeePrice) {
        platPrices.push(product.shopeePrice);
      } else {
        platPrices.push(currentPrice);
      }
    }
    const validPlatPrices = Array.from(
      new Set(platPrices.filter((p) => typeof p === "number" && !isNaN(p))),
    );
    if (validPlatPrices.length === 0) return "";
    const minPlatPrice = Math.min(...validPlatPrices);
    return formatIDR(minPlatPrice);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (productName: string, sizeName: string | null) => {
    const sizeText = sizeName ? ` ukuran ${sizeName}` : "";
    const text = `Halo Min, saya tertarik dengan Boneka ${productName}${sizeText} yang ada di website Simoengil.`;
    return `https://wa.me/6281545585448?text=${encodeURIComponent(text)}`;
  };

  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updated = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
  };

  const handleAddToCart = () => {
    if (isPurchaseDisabled) return;

    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === product.id &&
        item.selectedVariantType === (selectedType || undefined) &&
        item.selectedVariantSize === (selectedSize || undefined)
    );

    let updated;
    if (existingItemIndex >= 0) {
      updated = [...cart];
      updated[existingItemIndex] = {
        ...updated[existingItemIndex],
        quantity: updated[existingItemIndex].quantity + 1,
      };
    } else {
      const cartItemId = `${product.id}-${selectedType || "default"}-${selectedSize || "default"}-${Date.now()}`;
      const newItem: CartItem = {
        ...product,
        cartItemId,
        selectedVariantType: selectedType || undefined,
        selectedVariantSize: selectedSize || undefined,
        quantity: 1,
        selectedPrice: currentPrice ?? 0,
      };
      updated = [...cart, newItem];
    }

    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#0F4C5C", "#1A7A90"],
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

    if (!user) {
      setAuthRedirectUrl(checkoutUrl);
      setIsAuthModalOpen(true);
      return;
    }

    router.push(checkoutUrl);
  };

  const handleWishlistDetailClick = (p: Product) => {
    setIsWishlistOpen(false);
    router.push(`/product/${p.id}`);
  };

  const handleMarketplaceClick = (
    platform: "shopee" | "tokopedia" | "lazada" | "tiktok",
    url: string,
  ) => {
    let colors = ["#ff4d2f", "#ff8e2f", "#fff"];
    if (platform === "tokopedia") colors = ["#03ac0e", "#3cd070", "#fff"];
    if (platform === "lazada") colors = ["#0f136d", "#ff007f", "#00d2ff"];
    if (platform === "tiktok") colors = ["#000000", "#00f2fe", "#fe0979"];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: colors,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-pink-100 selection:text-pink-600 bg-transparent font-sans text-[#2C2C2C]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-white/50 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-pink-100/25 blur-3xl" />
        <div className="absolute bottom-[20%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-orange-100/20 blur-3xl" />
      </div>

      {/* PRODUCT DETAIL NAVBAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#FF8FB1] transition-colors group"
          >
            <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-white shadow-xs group-hover:shadow-sm border border-transparent group-hover:border-[#FFB6C8]/30 transition-all">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-heading hidden sm:inline">Kembali</span>
          </Link>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Tautan halaman berhasil disalin!");
            }}
            className="p-2 rounded-xl bg-slate-50 hover:bg-white shadow-xs hover:shadow-sm border border-transparent hover:border-[#FFB6C8]/30 text-slate-600 hover:text-[#FF8FB1] transition-all cursor-pointer flex items-center gap-2"
            title="Salin Tautan"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-bold hidden sm:inline">Bagikan</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 flex-1 overflow-x-hidden">

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
                  style={{
                    transform: `rotateY(${photoTilt.x}deg) rotateX(${photoTilt.y}deg)`,
                  }}
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
                      transform: isZoomed ? "scale(1.8)" : "scale(1)",
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out animate-in fade-in"
                  />
                </div>
                {/* Subtle pink gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFB6C8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Thumbnails Overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10 overflow-x-auto scrollbar-none">
                  {galleryImages.map((imgSrc, index) => {
                    const isActive =
                      activeImage === imgSrc ||
                      (index === 0 && activeImage === "");
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImage(imgSrc)}
                        className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm border-2 transition-all cursor-pointer hover:border-[#FFB6C8] shrink-0 ${
                          isActive
                            ? "border-[#FF8FB1] shadow-md scale-100"
                            : "border-transparent opacity-70 hover:opacity-100 scale-95"
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
              {galleryImages.includes("/images/plushie_lifestyle_car.png") && (
                <div
                  className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/30 flex items-start gap-2.5 gsap-reveal"
                  data-effect="fade-slide-right"
                >
                  <span className="text-base mt-0.5">🚗</span>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-[#E8B37D]">
                      Lifestyle Angle:
                    </span>{" "}
                    Boneka kami didesain multifungsi. Sangat lucu ditempatkan di
                    dasbor mobil sebagai penghias perjalanan Anda maupun
                    diletakkan di tempat tidur sebagai teman peluk tidur yang
                    nyaman.
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT META & ORDER ACTIONS (55% Width) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>


                {/* Product Name */}
                <h1 className="gsap-hero-title text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C2C2C] mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Sold count */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    {product.specifications?.soldCount || 0} Terjual
                  </span>
                </div>

                {/* Pricing Box */}
                <div className="my-6 p-5 rounded-[2rem] bg-[#FFF8F3]/60 border border-[#FFB6C8]/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Harga Pilihan Terbaik:
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#FF8FB1] tracking-tight">
                      {selectedType || selectedSize || minPrice === maxPrice
                        ? formatIDR(currentPrice)
                        : `${formatIDR(minPrice)} - ${formatIDR(maxPrice)}`}
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
                                ? "bg-white border-orange-500 text-orange-600"
                                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                            }`}
                          >
                            {typeObj.image && (
                              <img
                                src={typeObj.image}
                                alt={typeObj.name}
                                className="w-6 h-6 object-cover rounded shadow-sm"
                              />
                            )}
                            <div className="flex flex-col items-start">
                              <span>{typeObj.name}</span>
                              {typeObj.extraPrice ? (
                                <span className="text-[9px] text-orange-500/80 font-semibold">
                                  (+{formatIDR(typeObj.extraPrice)})
                                </span>
                              ) : null}
                            </div>
                            {isSelected && (
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-[8px] border-transparent border-b-orange-500 border-r-orange-500">
                                <span className="absolute -bottom-1 -right-1 text-white text-[8px] font-black translate-x-[2px] translate-y-[2px]">
                                  ✓
                                </span>
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
                                ? "bg-white border-orange-500 text-orange-600"
                                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                            }`}
                          >
                            <span>{szObj.name}</span>
                            {szObj.extraPrice ? (
                              <span className="text-[9px] text-orange-500/80 font-semibold">
                                (+{formatIDR(szObj.extraPrice)})
                              </span>
                            ) : null}
                            {isSelected && (
                              <div className="absolute bottom-0 right-0 w-0 h-0 border-[8px] border-transparent border-b-orange-500 border-r-orange-500">
                                <span className="absolute -bottom-1 -right-1 text-white text-[8px] font-black translate-x-[2px] translate-y-[2px]">
                                  ✓
                                </span>
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
                      onClick={() => handleAccordionToggle("deskripsi")}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Deskripsi Lengkap</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "deskripsi" ? "rotate-180 text-[#FF8FB1]" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${activeAccordion === "deskripsi" ? "max-h-96 pb-4" : "max-h-0"}`}
                    >
                      <p
                        className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium pl-6.5"
                        dangerouslySetInnerHTML={{
                          __html: product.description.replace(
                            /\*\*(.*?)\*\*/g,
                            "<strong>$1</strong>",
                          ),
                        }}
                      />
                    </div>
                  </div>

                  {/* 2. Spesifikasi & Bahan */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => handleAccordionToggle("spesifikasi")}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Spesifikasi & Bahan Premium</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "spesifikasi" ? "rotate-180 text-[#FF8FB1]" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${activeAccordion === "spesifikasi" ? "max-h-96 pb-4" : "max-h-0"}`}
                    >
                      <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pl-6.5 font-medium">
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-400">Bahan Utama</span>
                          <span className="font-bold text-slate-800">
                            {product.specifications.material}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="text-slate-400">
                            Dimensi / Ukuran
                          </span>
                          <span className="font-bold text-slate-800">
                            {product.specifications.size}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* 3. Kelebihan Boneka Simoengil */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => handleAccordionToggle("kelebihan")}
                      className="w-full py-4 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#FF8FB1]" />
                        <span>Kelebihan Boneka Simoengil</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "kelebihan" ? "rotate-180 text-[#FF8FB1]" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${activeAccordion === "kelebihan" ? "max-h-[32rem] overflow-y-auto pb-4" : "max-h-0"}`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6.5">
                        {product.specifications.features &&
                        product.specifications.features.length > 0 ? (
                          product.specifications.features.map((feat, idx) => {
                            // Rotate colors based on index
                            const colors = [
                              "bg-pink-50/50 border-pink-100/50",
                              "bg-amber-50/50 border-amber-100/50",
                              "bg-emerald-50/50 border-emerald-100/50",
                              "bg-blue-50/50 border-blue-100/50",
                              "bg-purple-50/50 border-purple-100/50",
                            ];
                            const colorClass = colors[idx % colors.length];

                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-2xl border flex gap-2 ${colorClass}`}
                              >
                                <span className="text-xl shrink-0">
                                  {feat.icon}
                                </span>
                                <div>
                                  <h5 className="font-bold text-xs text-[#2C2C2C]">
                                    {feat.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {feat.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <p className="text-xs text-slate-500 italic">
                              Belum ada informasi kelebihan khusus untuk produk
                              ini.
                            </p>
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
                    className={`flex-1 py-4 px-2 ${isPurchaseDisabled ? "bg-slate-300" : "bg-[#0F4C5C] hover:bg-[#0B3A46] hover:scale-[1.02]"} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer`}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span>+ Keranjang</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isPurchaseDisabled}
                    className={`flex-1 py-4 px-2 ${isPurchaseDisabled ? "bg-slate-300" : "bg-[#FF8FB1] hover:bg-[#FF7A9F] hover:scale-[1.02]"} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer`}
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>

                <div className="w-full mt-3">
                  <button
                    onClick={() => {
                      const url = product.shopeeLink;
                      if (url) handleMarketplaceClick("shopee", url);
                    }}
                    disabled={
                      isPurchaseDisabled ||
                      !isShopeeAvailable ||
                      !product.shopeeLink
                    }
                    className={`w-full py-4 px-2 ${isPurchaseDisabled || !isShopeeAvailable || !product.shopeeLink ? "bg-slate-300" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02]"} text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer`}
                  >
                    <span>Beli di Shopee</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <SiteFooter />


      {/* CART DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={handleWishlistDetailClick}
        isLoggedIn={!!user}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthRedirectUrl(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (authRedirectUrl) {
            router.push(authRedirectUrl);
            setAuthRedirectUrl(null);
          }
        }}
      />
    </div>
  );
}
