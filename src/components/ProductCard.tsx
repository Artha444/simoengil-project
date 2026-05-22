'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
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

  const getMarketplacePrice = (platform: 'shopee' | 'tokopedia' | 'lazada' | 'tiktok') => {
    let prices: number[] = [];
    if (platform === 'shopee') {
      if (product.shopeeAvailable !== false) prices.push(product.shopeePrice || product.price);
      product.variants?.forEach(v => {
        if (v.shopeeAvailable !== false) prices.push(v.shopeePrice || v.price || product.price);
      });
    } else if (platform === 'tokopedia') {
      if (product.tokopediaAvailable !== false) prices.push(product.tokopediaPrice || product.price);
      product.variants?.forEach(v => {
        if (v.tokopediaAvailable !== false) prices.push(v.tokopediaPrice || v.price || product.price);
      });
    } else if (platform === 'lazada') {
      if (product.lazadaAvailable !== false) prices.push(product.lazadaPrice || product.price);
      product.variants?.forEach(v => {
        if (v.lazadaAvailable !== false) prices.push(v.lazadaPrice || v.price || product.price);
      });
    } else if (platform === 'tiktok') {
      if (product.tiktokAvailable !== false) prices.push(product.tiktokPrice || product.price);
      product.variants?.forEach(v => {
        if (v.tiktokAvailable !== false) prices.push(v.tiktokPrice || v.price || product.price);
      });
    }

    const validPrices = Array.from(new Set(prices.filter(p => typeof p === 'number' && !isNaN(p))));
    if (validPrices.length === 0) return '';
    const minPrice = Math.min(...validPrices);
    return formatIDR(minPrice);
  };

  const handleBuyClick = (platform: 'shopee' | 'tokopedia' | 'lazada' | 'tiktok', url: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-[2.2rem] p-2 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_50px_-15px_rgba(255,143,177,0.18)] hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between border border-pink-100/40 hover:border-[#FFB6C8]/45">
      {/* Badge di pojok kiri atas */}
      {product.status && (
        <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-5 z-10">
          <span className="text-[8px] sm:text-[10px] font-bold tracking-wider px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-[#FFB6C8] text-white shadow-xs border border-white/20 uppercase font-heading group-hover:scale-110 group-hover:shadow-md transition-all inline-block">
            {product.status}
          </span>
        </div>
      )}

      {/* Wishlist Button Overlay */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-2.5 right-2.5 sm:top-5 sm:right-5 z-10 p-1.5 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:shadow-md border border-pink-100/60 hover:bg-[#FFF5F0] transition-all duration-300 group/heart hover:scale-110 active:scale-95 cursor-pointer"
        aria-label={isWishlisted ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
      >
        <Heart
          className={`w-4.5 h-4.5 transition-all duration-300 ${
            isWishlisted ? 'fill-[#FF8FB1] stroke-[#FF8FB1] animate-heart-burst' : 'stroke-slate-400 group-hover/heart:stroke-[#FF8FB1]'
          }`}
        />
      </button>

      <div>
        {/* Product Image */}
        <div 
          className="relative w-full aspect-square rounded-xl sm:rounded-[1.8rem] overflow-hidden bg-gradient-to-tr from-[#FFF5F0] to-white cursor-pointer mb-2 sm:mb-4"
          onClick={() => onDetailClick(product)}
        >
          {/* Menggunakan img standar untuk mencegah runtime unconfigured host error */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 group-hover:animate-bobble transition-transform duration-700 ease-out origin-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FF8FB1]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Rating (Fade-in on Hover, always visible on Mobile) */}
        <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 mb-2">
          <div className="flex text-[#E8B37D] gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 fill-current ${
                  i < Math.floor(product.rating) ? 'text-[#E8B37D]' : 'text-slate-200'
                }`} 
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-[#2C2C2C]">{product.rating}</span>
          <span className="text-[8px] sm:text-[10px] text-slate-400">({product.reviewsCount})</span>
        </div>

        {/* Product Name (Bold, max 2 lines) */}
        <h3 
          className="font-bold text-[#2C2C2C] text-xs sm:text-base group-hover:text-[#FF8FB1] transition-all duration-300 cursor-pointer line-clamp-2 mb-0.5 sm:mb-1 font-heading group-hover:translate-y-[-2px] leading-tight"
          onClick={() => onDetailClick(product)}
        >
          {product.name}
        </h3>

        {/* Product Price */}
        <p className="font-extrabold text-[#FF8FB1] text-sm sm:text-lg mb-2 sm:mb-4 group-hover:translate-y-[-2px] transition-transform duration-300">
          {getPriceDisplay()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1 sm:space-y-3 mt-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
          {/* Shopee Button */}
          {product.shopeeLink && product.shopeeAvailable !== false && (
            <button
              onClick={(e) => handleBuyClick('shopee', product.shopeeLink!, e)}
              className="py-1.5 px-2 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-shopee hover:bg-shopee-hover text-white hover:scale-[1.03] active:scale-95 hover:animate-wiggle shadow-md shadow-orange-500/10"
            >
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold w-full justify-center overflow-hidden">
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Shopee</span>
              </div>
              <span className="text-[9px] font-medium opacity-90 truncate">{getMarketplacePrice('shopee')}</span>
            </button>
          )}

          {/* Tokopedia Button */}
          {product.tokopediaLink && product.tokopediaAvailable !== false && (
            <button
              onClick={(e) => handleBuyClick('tokopedia', product.tokopediaLink!, e)}
              className="py-1.5 px-2 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-tokopedia hover:bg-tokopedia-hover text-white hover:scale-[1.03] active:scale-95 hover:animate-wiggle shadow-md shadow-green-500/10"
            >
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold w-full justify-center overflow-hidden">
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Tokopedia</span>
              </div>
              <span className="text-[9px] font-medium opacity-90 truncate">{getMarketplacePrice('tokopedia')}</span>
            </button>
          )}

          {/* Lazada (Smaller icon button) */}
          {product.lazadaLink && product.lazadaAvailable !== false && (
            <button
              onClick={(e) => handleBuyClick('lazada', product.lazadaLink!, e)}
              className="py-1.5 px-2 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-lazada hover:bg-lazada-hover text-white hover:scale-[1.03] active:scale-95 hover:animate-wiggle shadow-md shadow-blue-500/10"
              title="Lazada"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold w-full justify-center overflow-hidden">
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Lazada</span>
              </div>
              <span className="text-[9px] font-medium opacity-90 truncate">{getMarketplacePrice('lazada')}</span>
            </button>
          )}

          {/* TikTok (Smaller icon button) */}
          {product.tiktokLink && product.tiktokAvailable !== false && (
            <button
              onClick={(e) => handleBuyClick('tiktok', product.tiktokLink!, e)}
              className="py-1.5 px-2 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-[#000000] hover:bg-slate-800 text-white hover:scale-[1.03] active:scale-95 hover:animate-wiggle shadow-md shadow-slate-900/10"
              title="TikTok Shop"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold w-full justify-center overflow-hidden">
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">TikTok</span>
              </div>
              <span className="text-[9px] font-medium opacity-90 truncate">{getMarketplacePrice('tiktok')}</span>
            </button>
          )}
        </div>

        {/* Lihat Detail Button */}
        <Link
          href={`/product/${product.id}`}
          className="w-full py-3 px-4 border-2 border-pink-100 hover:border-[#FF8FB1] text-[#FF8FB1] hover:text-white hover:bg-[#FF8FB1] rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          <span>Lihat Detail Teman Peluk</span>
        </Link>
      </div>
    </div>
  );
};
