"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Smile,
  RefreshCw,
  Star,
} from "lucide-react";
import { Product } from "@/data/products";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import confetti from "canvas-confetti";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variantSize?: string, variantType?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [selectedSizeState, setSelectedSizeState] = useState<string | null>(null);
  const [selectedTypeState, setSelectedTypeState] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const productTypes = product?.specifications?.types || [];
  const productSizes = product?.specifications?.sizes || [];
  
  const hasTypes = productTypes.length > 0;
  const hasSizes = productSizes.length > 0;
  
  const isTypeSelected = !hasTypes || selectedTypeState !== null;
  const isSizeSelected = !hasSizes || selectedSizeState !== null;
  const isPurchaseDisabled = !isTypeSelected || !isSizeSelected;


  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product, isOpen]);

  if (!product || !isOpen) return null;

  const additionalImages = (
    product.specifications?.images ||
    product.images ||
    []
  ).filter(Boolean);
  const galleryImages = [product.image, ...additionalImages];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    let colors = ["#ff4d2f", "#ff8e2f", "#fff"];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });

    // Find URL to open
    let url = product?.shopeeLink || "https://shopee.co.id";
    if (product.variants?.[0]?.size && product?.variants) {
      const v = product.variants.find(
        (v) => v.size === product.variants?.[0]?.size,
      );
      if (v && v.shopeeUrl) url = v.shopeeUrl;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0F1D]/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-100/50 flex flex-col md:flex-row transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-[#FFF5F0] text-slate-500 hover:text-[#FF8FB1] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Image */}
        <div className="md:w-1/2 p-6 bg-[#FFF8F3]/60 flex flex-col justify-center relative min-h-[300px] md:min-h-[400px]">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-pink-100/30 flex items-center justify-center group shadow-sm">
            <img
              src={activeImage || product.image}
              referrerPolicy="no-referrer"
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Thumbnails Overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10 overflow-x-auto scrollbar-none">
              {galleryImages.map((imgSrc, index) => {
                const isActive =
                  activeImage === imgSrc || (index === 0 && activeImage === "");
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgSrc)}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm border-2 transition-all cursor-pointer hover:border-[#FFB6C8] shrink-0 ${
                      isActive
                        ? "border-[#FF8FB1] shadow-md scale-100"
                        : "border-transparent opacity-70 hover:opacity-100 scale-95"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      referrerPolicy="no-referrer"
                      alt={`Preview ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Badges Removed per request */}

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-[#2C2C2C] mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-[#E8B37D] stroke-[#E8B37D]"
                        : "stroke-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">
                {product.rating}
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount} Ulasan Pembeli)
              </span>
            </div>

            {/* Price Information */}
            <div className="mb-5 space-y-1.5">
              <div className="grid grid-cols-1 gap-2">
                {/* Shopee */}
                <div className="bg-orange-50/60 border border-orange-100/70 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-black text-[#ee4d2d] uppercase tracking-wider mb-1">
                    Harga Spesial Shopee
                  </span>
                  <span
                    className={
                      product.shopeeAvailable !== false
                        ? "text-base font-extrabold text-[#ee4d2d]"
                        : "text-[11px] font-semibold text-slate-400"
                    }
                  >
                    {product.shopeeAvailable !== false
                      ? formatIDR(product.shopeePrice ?? product.price)
                      : "tidak tersedia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <h3 className="font-bold text-[#2C2C2C] text-sm mb-1.5">
                Deskripsi
              </h3>
              <p
                className="text-slate-600 text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>",
                  ),
                }}
              />
            </div>

            {/* Features/Specs Checklist */}
            <div className="bg-[#FFF5F0] rounded-2xl p-4 border border-[#FFB6C8]/25 space-y-3 mb-6">
              <h4 className="font-bold text-[#2C2C2C] text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8FB1]" />
                Spesifikasi Boneka Simoengil
              </h4>

              <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                {product.specifications?.features &&
                product.specifications.features.length > 0 ? (
                  product.specifications.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 text-base leading-none">{feature.icon || '✨'}</span>
                      <div className="font-medium">{feature.title}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700">
                          Bahan Premium:
                        </span>{" "}
                        {product.specifications.material}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Smile className="w-4 h-4 text-[#E8B37D] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700">
                          Ukuran Ideal:
                        </span>{" "}
                        {product.specifications.size}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-[#FF8FB1] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700">
                          Perawatan:
                        </span>{" "}
                        {product.specifications.washing}
                      </div>
                    </div>

                    {product.specifications.safeForKids && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-emerald-600">
                            ✓
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          100% Aman & Hypoallergenic
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Call to Actions */}
          <div className="space-y-3.5">
            {/* Variant Type Selection */}
            {hasTypes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Varian</label>
                <select
                  value={selectedTypeState || ''}
                  onChange={e => setSelectedTypeState(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="" disabled>-- Pilih Varian --</option>
                  {productTypes.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name}{t.extraPrice ? ` (+${formatIDR(t.extraPrice)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Variant Size Selection */}
            {hasSizes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ukuran</label>
                <select
                  value={selectedSizeState || ''}
                  onChange={e => setSelectedSizeState(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="" disabled>-- Pilih Ukuran --</option>
                  {productSizes.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name}{s.extraPrice ? ` (+${formatIDR(s.extraPrice)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 w-full mt-4">
              <button
                disabled={isPurchaseDisabled}
                onClick={() => {
                  const selectedSize = selectedSizeState || undefined;
                  const selectedType = selectedTypeState || undefined;
                  onAddToCart(product, selectedSize, selectedType);
                  onClose();
                }}
                className={`flex-1 py-3 px-2 ${isPurchaseDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#0F4C5C] hover:bg-[#0B3A46] text-white hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(15,76,92,0.2)]'} rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>+ Keranjang</span>
              </button>
            </div>


          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          router.push(`/checkout?product_id=${product.id}`);
        }}
      />
    </div>
  );
};
