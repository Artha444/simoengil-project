'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Product } from '@/data/products';
import confetti from 'canvas-confetti';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (id: string) => void;
  onDetailClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onWishlistToggle,
  onDetailClick,
}) => {
  // Format price to IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getPriceDisplay = () => {
    const prices: number[] = [];
    
    // Check base product availability
    const shopeeAvail = product.shopeeAvailable !== false;
    const tokopediaAvail = product.tokopediaAvailable !== false;
    const lazadaAvail = product.lazadaAvailable !== false;
    const tiktokAvail = product.tiktokAvailable !== false;

    if (shopeeAvail) prices.push(product.shopeePrice || product.price);
    if (tokopediaAvail) prices.push(product.tokopediaPrice || product.price);
    if (lazadaAvail) prices.push(product.lazadaPrice || product.price);
    if (tiktokAvail) prices.push(product.tiktokPrice || product.price);
    
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const vShopeeAvail = v.shopeeAvailable !== false;
        const vTokopediaAvail = v.tokopediaAvailable !== false;
        const vLazadaAvail = v.lazadaAvailable !== false;
        const vTiktokAvail = v.tiktokAvailable !== false;

        if (vShopeeAvail) prices.push(v.shopeePrice || v.price || product.price);
        if (vTokopediaAvail) prices.push(v.tokopediaPrice || v.price || product.price);
        if (vLazadaAvail) prices.push(v.lazadaPrice || v.price || product.price);
        if (vTiktokAvail) prices.push(v.tiktokPrice || v.price || product.price);
      });
    }

    const validPrices = Array.from(new Set(prices.filter(p => typeof p === 'number' && !isNaN(p))));

    if (validPrices.length === 0) {
      return "Tidak tersedia";
    }

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    if (minPrice === maxPrice) {
      return formatIDR(minPrice);
    }
    return `${formatIDR(minPrice)} - ${formatIDR(maxPrice)}`;
  };

  const handleBuyClick = (platform: 'shopee' | 'tokopedia' | 'lazada' | 'tiktok', url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Confetti effect!
    let colors = ['#ff4d2f', '#ff8e2f', '#fff'];
    if (platform === 'tokopedia') colors = ['#03ac0e', '#3cd070', '#fff'];
    if (platform === 'lazada') colors = ['#0f136d', '#ff007f', '#00d2ff'];
    if (platform === 'tiktok') colors = ['#000000', '#00f2fe', '#fe0979'];

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: colors,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle(product.id);
    if (!isWishlisted) {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff8fa3', '#ff4d6d'],
      });
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Best Seller':
        return 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-sm';
      case 'Stok Terbatas':
        return 'bg-rose-100 text-rose-600 border border-rose-200';
      case 'Baru':
        return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
      default:
        return 'bg-blue-100 text-blue-600 border border-blue-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-blue-100/50 hover:-translate-y-1">
      {/* Wishlist Button Overlay */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md border border-pink-100 hover:bg-pink-50 transition-colors group/heart"
        aria-label={isWishlisted ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
      >
        <Heart
          className={`w-5 h-5 transition-transform duration-300 group-hover/heart:scale-110 ${
            isWishlisted ? 'fill-brand-pink-dark stroke-brand-pink-dark' : 'stroke-slate-400'
          }`}
        />
      </button>

      <div>
        {/* Product Image */}
        <div 
          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 cursor-pointer mb-4"
          onClick={() => onDetailClick(product)}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            priority={product.id === '1' || product.id === '2'}
          />
          <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Status Tag */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeStyle(product.status)}`}>
            {product.status}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            {product.rating} ({product.reviewsCount})
          </span>
        </div>

        {/* Product Name */}
        <h3 
          className="font-bold text-slate-800 text-lg group-hover:text-pink-500 transition-colors cursor-pointer line-clamp-1 mb-1"
          onClick={() => onDetailClick(product)}
        >
          {product.name}
        </h3>

        {/* Product Price */}
        <p className="font-extrabold text-pink-500 text-lg mb-4 line-clamp-1">
          {getPriceDisplay()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        <div className="grid grid-cols-2 gap-2">
          {/* Shopee Button */}
          <button
            disabled={!product.shopeeLink || product.shopeeAvailable === false}
            onClick={(e) => product.shopeeLink && product.shopeeAvailable !== false && handleBuyClick('shopee', product.shopeeLink, e)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !product.shopeeLink || product.shopeeAvailable === false
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                : 'bg-shopee hover:bg-shopee-hover text-white shadow-orange-500/10 hover:shadow-md hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Shopee</span>
          </button>

          {/* Tokopedia Button */}
          <button
            disabled={!product.tokopediaLink || product.tokopediaAvailable === false}
            onClick={(e) => product.tokopediaLink && product.tokopediaAvailable !== false && handleBuyClick('tokopedia', product.tokopediaLink, e)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !product.tokopediaLink || product.tokopediaAvailable === false
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                : 'bg-tokopedia hover:bg-tokopedia-hover text-white shadow-green-500/10 hover:shadow-md hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Tokopedia</span>
          </button>

          {/* Lazada Button */}
          <button
            disabled={!product.lazadaLink || product.lazadaAvailable === false}
            onClick={(e) => product.lazadaLink && product.lazadaAvailable !== false && handleBuyClick('lazada', product.lazadaLink, e)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !product.lazadaLink || product.lazadaAvailable === false
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                : 'bg-lazada hover:bg-lazada-hover text-white shadow-blue-900/10 hover:shadow-md hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Lazada</span>
          </button>

          {/* TikTok Button */}
          <button
            disabled={!product.tiktokLink || product.tiktokAvailable === false}
            onClick={(e) => product.tiktokLink && product.tiktokAvailable !== false && handleBuyClick('tiktok', product.tiktokLink, e)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !product.tiktokLink || product.tiktokAvailable === false
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none'
                : 'bg-tiktok hover:bg-tiktok-hover text-white shadow-black/10 hover:shadow-md hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>TikTok</span>
          </button>
        </div>

        {/* Detail Button */}
        <Link
          href={`/product/${product.id}`}
          className="w-full py-2.5 px-4 border border-blue-200 hover:border-pink-300 text-blue-600 hover:text-pink-500 rounded-xl text-xs font-bold transition-all hover:bg-pink-50/50 flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat Detail Teman Peluk</span>
        </Link>
      </div>
    </div>
  );
};
