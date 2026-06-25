"use client";

import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Heart,
  ShoppingCart,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Smile,
  RefreshCw,
  Star,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { Product } from "@/data/products";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import confetti from "canvas-confetti";
import { lockBodyScroll } from "@/lib/scrollLock";

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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [selectedSizeState, setSelectedSizeState] = useState<string | null>(null);
  const [selectedTypeState, setSelectedTypeState] = useState<string | null>(null);
  
  // Touch Swipe-to-Dismiss Refs
  const touchStartYRef = useRef<number | null>(null);
  const translateYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      translateYRef.current = 0;
      touchStartYRef.current = null;
      isDraggingRef.current = false;
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.transition = '';
      }
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const isAtTop = scrollContainerRef.current ? scrollContainerRef.current.scrollTop === 0 : true;
    if (isAtTop) {
      touchStartYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
      if (cardRef.current) {
        cardRef.current.style.transition = 'none';
      }
    } else {
      touchStartYRef.current = null;
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || !isDraggingRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartYRef.current;
    
    const isAtTop = scrollContainerRef.current ? scrollContainerRef.current.scrollTop === 0 : true;
    
    if (diffY > 0 && isAtTop) {
      if (e.cancelable) e.preventDefault();
      translateYRef.current = diffY;
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(0, ${diffY}px, 0)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (translateYRef.current > 120) {
      onClose();
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        cardRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
    }
    touchStartYRef.current = null;
    translateYRef.current = 0;
    isDraggingRef.current = false;
  };

  const [isDescOpen, setIsDescOpen] = useState(false);

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

  useEffect(() => {
    lockBodyScroll(isOpen, 'product-detail');
    return () => lockBodyScroll(false, 'product-detail');
  }, [isOpen]);

  const [show, setShow] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setIsClosing(false);
    } else if (show) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShow(false);
        setIsClosing(false);
      }, 300); // 300ms matches the animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, show]);

  useLayoutEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product || !show) return null;

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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#0A0F1D]/45 backdrop-blur-xs transition-opacity duration-300 ${isClosing ? 'animate-fade-out-custom' : 'animate-fade-in-custom'}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        ref={cardRef}
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
        className={`relative bg-white rounded-t-[2rem] rounded-b-none md:rounded-[2.5rem] w-full md:max-w-4xl h-[85vh] md:h-auto max-h-[85vh] md:max-h-[90vh] shadow-2xl border border-pink-100/50 flex flex-col overflow-hidden ${isClosing ? 'animate-slide-down-custom' : 'animate-slide-up-custom'}`}
      >
        {/* Mobile Drag Handle */}
        <div 
          className="md:hidden w-full flex flex-col items-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing select-none z-30"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-[#FFF5F0] text-slate-600 hover:text-[#FF8FB1] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-sm border border-slate-100 items-center justify-center"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Inner Flex Container */}
        <div 
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="mobile-no-scrollbar w-full h-full max-h-[85vh] md:max-h-[90vh] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
        >
          {/* Left Side: Image */}
          <div className="md:w-1/2 p-6 md:p-8 bg-[#FFF8F3]/60 flex flex-col justify-center relative shrink-0 min-h-[300px] md:min-h-full">
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
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col md:overflow-y-auto scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
          <div>
            {/* Badges Removed per request */}

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-[#2C2C2C] mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Price Information */}
            <div className="mb-5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FF8FB1] tracking-tight">
                {formatIDR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through font-bold decoration-slate-300 decoration-2 ml-2">
                  {formatIDR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-5 border-b border-slate-100">
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full py-3 flex items-center justify-between font-heading font-black text-sm text-[#2C2C2C] hover:text-[#FF8FB1] transition-colors focus:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#FF8FB1]" />
                  <span>Deskripsi Lengkap</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDescOpen ? 'rotate-180 text-[#FF8FB1]' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isDescOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                <p
                  className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium pl-6.5"
                  dangerouslySetInnerHTML={{
                    __html: product.description.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>",
                    ),
                  }}
                />
              </div>
            </div>


          </div>

          {/* Action Call to Actions */}
          <div className="space-y-3.5">
            {/* Variant Type Selection */}
            {hasTypes && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Varian</label>
                <div className="flex flex-wrap gap-2">
                  {productTypes.map(t => {
                    const isSelected = selectedTypeState === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => setSelectedTypeState(t.name)}
                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border-2 overflow-hidden flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#FF8FB1] text-[#FF8FB1] bg-[#FFF5F0] shadow-[0_0_10px_rgba(255,143,177,0.15)] scale-[1.02]'
                            : 'border-slate-100 text-slate-600 hover:border-pink-200 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 bg-[#FF8FB1]/10 animate-pulse" />
                        )}
                        <span className="relative z-10">{t.name}</span>
                        {t.extraPrice ? (
                          <span className={`relative z-10 text-xs font-bold ${isSelected ? 'text-[#FF8FB1]' : 'text-slate-400'}`}>
                            (+{formatIDR(t.extraPrice)})
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Size Selection */}
            {hasSizes && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Ukuran</label>
                <div className="flex flex-wrap gap-2">
                  {productSizes.map(s => {
                    const isSelected = selectedSizeState === s.name;
                    return (
                      <button
                        key={s.name}
                        onClick={() => setSelectedSizeState(s.name)}
                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border-2 overflow-hidden flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#0F4C5C] text-[#0F4C5C] bg-cyan-50 shadow-[0_0_10px_rgba(15,76,92,0.1)] scale-[1.02]'
                            : 'border-slate-100 text-slate-600 hover:border-cyan-100 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 bg-[#0F4C5C]/5 animate-pulse" />
                        )}
                        <span className="relative z-10">{s.name}</span>
                        {s.extraPrice ? (
                          <span className={`relative z-10 text-xs font-bold ${isSelected ? 'text-[#0F4C5C]' : 'text-slate-400'}`}>
                            (+{formatIDR(s.extraPrice)})
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
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
                className={`flex-1 py-3 px-2 ${isPurchaseDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-white border-2 border-[#0F4C5C] text-[#0F4C5C] hover:bg-slate-50 hover:scale-[1.02] active:scale-95'} rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>+ Keranjang</span>
              </button>
              <button
                disabled={isPurchaseDisabled}
                onClick={() => {
                  const selectedSize = selectedSizeState || undefined;
                  const selectedType = selectedTypeState || undefined;
                  
                  if (!user) {
                    setIsAuthOpen(true);
                    return;
                  }

                  onClose();
                  let checkoutUrl = `/checkout?product_id=${product.id}`;
                  if (selectedSize) checkoutUrl += `&variant=${selectedSize}`;
                  if (selectedType) checkoutUrl += `&type=${selectedType}`;
                  router.push(checkoutUrl);
                }}
                className={`flex-1 py-3 px-2 ${isPurchaseDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#0F4C5C] hover:bg-[#0B3A46] text-white hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(15,76,92,0.2)]'} rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>Beli Sekarang</span>
              </button>
            </div>


          </div>
        </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          let checkoutUrl = `/checkout?product_id=${product.id}`;
          if (selectedSizeState) checkoutUrl += `&variant=${selectedSizeState}`;
          if (selectedTypeState) checkoutUrl += `&type=${selectedTypeState}`;
          router.push(checkoutUrl);
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from {
            transform: translate3d(0, 100%, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, 100%, 0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-slide-up-custom {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-down-custom {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-custom {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-fade-out-custom {
          animation: fadeOut 0.3s ease-out forwards;
        }
        .mobile-no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
      `}} />
    </div>
  );
};
