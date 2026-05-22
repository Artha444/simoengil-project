'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Heart, ShoppingCart, ShieldCheck, Sparkles, Smile, RefreshCw, Star } from 'lucide-react';
import { Product } from '@/data/products';
import confetti from 'canvas-confetti';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onWishlistToggle: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onWishlistToggle,
}) => {
  const [activeImage, setActiveImage] = useState<string>('');

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product, isOpen]);

  if (!product || !isOpen) return null;

  const additionalImages = (product.specifications?.images || product.images || []).filter(Boolean);
  const galleryImages = [
    product.image,
    ...additionalImages
  ];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleBuyClick = (platform: 'shopee' | 'tokopedia' | 'lazada' | 'tiktok', url: string) => {
    let colors = ['#ff4d2f', '#ff8e2f', '#fff'];
    if (platform === 'tokopedia') colors = ['#03ac0e', '#3cd070', '#fff'];
    if (platform === 'lazada') colors = ['#0f136d', '#ff007f', '#00d2ff'];
    if (platform === 'tiktok') colors = ['#000000', '#00f2fe', '#fe0979'];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-100 flex flex-col md:flex-row transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Image */}
        <div className="md:w-1/2 p-6 bg-slate-50 flex flex-col justify-center gap-4 relative min-h-[300px] md:min-h-[400px]">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {galleryImages.map((imgSrc, index) => {
              const isActive = activeImage === imgSrc || (index === 0 && activeImage === '');
              return (
                <button
                  key={index}
                  onClick={() => setActiveImage(imgSrc)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-white border transition-all cursor-pointer hover:border-pink-300 ${
                    isActive ? 'border-pink-400 shadow-sm scale-95' : 'border-slate-100'
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={`Preview ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
          
          {/* Wishlist Heart Overlay */}
          <button
            onClick={() => onWishlistToggle(product.id)}
            className="absolute top-6 left-6 p-3 rounded-full bg-white shadow-md border border-pink-100 hover:bg-pink-50 transition-colors group cursor-pointer z-10"
            aria-label={isWishlisted ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <Heart
              className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                isWishlisted ? 'fill-brand-pink-dark stroke-brand-pink-dark' : 'stroke-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Right Side: Details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Category and Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                {product.category}
              </span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                {product.status}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight">
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
                        ? 'fill-amber-400 stroke-amber-400' 
                        : 'stroke-slate-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount} Ulasan Pembeli)</span>
            </div>

            {/* Multi-Platform Pricing Grid */}
            <div className="mb-4 space-y-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Harga di Berbagai Marketplace:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Tokopedia */}
                <div className="bg-emerald-50/60 border border-emerald-100/70 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[8px] font-black text-[#42b549] uppercase tracking-wider mb-0.5">Tokopedia</span>
                  <span className={product.tokopediaAvailable !== false ? "text-xs font-extrabold text-[#42b549]" : "text-[9px] font-semibold text-slate-400"}>
                    {product.tokopediaAvailable !== false ? formatIDR(product.tokopediaPrice ?? product.price) : "tidak tersedia di marketplace ini"}
                  </span>
                </div>

                {/* Shopee */}
                <div className="bg-orange-50/60 border border-orange-100/70 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[8px] font-black text-[#ee4d2d] uppercase tracking-wider mb-0.5">Shopee</span>
                  <span className={product.shopeeAvailable !== false ? "text-xs font-extrabold text-[#ee4d2d]" : "text-[9px] font-semibold text-slate-400"}>
                    {product.shopeeAvailable !== false ? formatIDR(product.shopeePrice ?? product.price) : "tidak tersedia di marketplace ini"}
                  </span>
                </div>

                {/* Lazada */}
                <div className="bg-blue-50/60 border border-blue-100/70 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[8px] font-black text-[#0f136d] uppercase tracking-wider mb-0.5">Lazada</span>
                  <span className={product.lazadaAvailable !== false ? "text-xs font-extrabold text-[#0f136d]" : "text-[9px] font-semibold text-slate-400"}>
                    {product.lazadaAvailable !== false ? formatIDR(product.lazadaPrice ?? product.price) : "tidak tersedia di marketplace ini"}
                  </span>
                </div>

                {/* TikTok */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[8px] font-black text-slate-800 uppercase tracking-wider mb-0.5">TikTok Shop</span>
                  <span className={product.tiktokAvailable !== false ? "text-xs font-extrabold text-slate-800" : "text-[9px] font-semibold text-slate-400"}>
                    {product.tiktokAvailable !== false ? formatIDR(product.tiktokPrice ?? product.price) : "tidak tersedia di marketplace ini"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Deskripsi</h3>
              <p 
                className="text-slate-600 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>

            {/* Features/Specs Checklist */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 space-y-3 mb-6">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Spesifikasi Boneka Simoengil
              </h4>
              
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                {product.specifications?.features && product.specifications.features.length > 0 ? (
                  product.specifications.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>{feature}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">Bahan Premium:</span>{' '}
                        {product.specifications.material}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Smile className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">Ukuran Ideal:</span>{' '}
                        {product.specifications.size}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">Perawatan:</span>{' '}
                        {product.specifications.washing}
                      </div>
                    </div>

                    {product.specifications.safeForKids && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-emerald-600">✓</span>
                        </div>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          100% Aman & Hypoallergenic untuk Anak-anak
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Call to Actions */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Beli Sekarang di Official Store Kami:
            </h5>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Shopee */}
              <button
                disabled={!product.shopeeLink || product.shopeeAvailable === false}
                onClick={() => product.shopeeLink && product.shopeeAvailable !== false && handleBuyClick('shopee', product.shopeeLink)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  !product.shopeeLink || product.shopeeAvailable === false
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                    : 'bg-shopee hover:bg-shopee-hover text-white shadow-md shadow-orange-500/10 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Beli di Shopee</span>
              </button>

              {/* Tokopedia */}
              <button
                disabled={!product.tokopediaLink || product.tokopediaAvailable === false}
                onClick={() => product.tokopediaLink && product.tokopediaAvailable !== false && handleBuyClick('tokopedia', product.tokopediaLink)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  !product.tokopediaLink || product.tokopediaAvailable === false
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                    : 'bg-tokopedia hover:bg-tokopedia-hover text-white shadow-md shadow-green-500/10 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Beli di Tokopedia</span>
              </button>

              {/* Lazada */}
              <button
                disabled={!product.lazadaLink || product.lazadaAvailable === false}
                onClick={() => product.lazadaLink && product.lazadaAvailable !== false && handleBuyClick('lazada', product.lazadaLink)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  !product.lazadaLink || product.lazadaAvailable === false
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                    : 'bg-lazada hover:bg-lazada-hover text-white shadow-md shadow-blue-900/10 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Beli di Lazada</span>
              </button>

              {/* TikTok */}
              <button
                disabled={!product.tiktokLink || product.tiktokAvailable === false}
                onClick={() => product.tiktokLink && product.tiktokAvailable !== false && handleBuyClick('tiktok', product.tiktokLink)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  !product.tiktokLink || product.tiktokAvailable === false
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                    : 'bg-tiktok hover:bg-tiktok-hover text-white shadow-md shadow-black/10 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Beli di TikTok Shop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
