'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/data/products';
import confetti from 'canvas-confetti';

interface ProductCardProps {
  product: Product;
  cartItemCount: number;
  onDetailClick: (product: Product) => void;
}
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartItemCount,
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

    if (shopeeAvail) prices.push(product.shopeePrice || product.price);
    
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const vShopeeAvail = v.shopeeAvailable !== false;

        if (vShopeeAvail) prices.push(v.shopeePrice || v.price || product.price);
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

  const getMarketplacePrice = (platform: 'shopee') => {
    let prices: number[] = [];
    if (platform === 'shopee') {
      if (product.shopeeAvailable !== false) prices.push(product.shopeePrice || product.price);
      product.variants?.forEach(v => {
        if (v.shopeeAvailable !== false) prices.push(v.shopeePrice || v.price || product.price);
      });
    }

    const validPrices = Array.from(new Set(prices.filter(p => typeof p === 'number' && !isNaN(p))));
    if (validPrices.length === 0) return '';
    const minPrice = Math.min(...validPrices);
    return formatIDR(minPrice);
  };

  const handleBuyClick = (platform: 'shopee', url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let colors = ['#ff4d2f', '#ff8e2f', '#fff'];

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: colors,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-[2.2rem] p-2 sm:p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between border border-slate-100 hover:border-slate-200">
      {/* Badge Removed per request */}



      <div>
        {/* Product Image */}
        <div 
          className="relative w-full aspect-[4/5] rounded-xl sm:rounded-[1.8rem] overflow-hidden bg-gradient-to-tr from-slate-50 to-white cursor-pointer mb-3 sm:mb-5 border border-slate-50"
          onClick={() => onDetailClick(product)}
        >
          {/* Menggunakan img standar untuk mencegah runtime unconfigured host error */}
          <img
            src={product.image}
            referrerPolicy="no-referrer"
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 group-hover:animate-bobble transition-transform duration-700 ease-out origin-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-700">{Number(product.rating).toFixed(1)}</span>
          <span className="text-[10px] sm:text-xs text-slate-400">| Terjual {product.specifications?.soldCount || 0}</span>
        </div>

        {/* Product Name */}
        <h3 
          className="font-medium text-slate-800 text-xs sm:text-sm group-hover:text-teal-700 transition-colors duration-300 cursor-pointer line-clamp-2 mb-1 sm:mb-2 leading-tight"
          onClick={() => onDetailClick(product)}
        >
          {product.name}
        </h3>

        {/* Product Price */}
        <p className="font-black text-[#2C2C2C] text-base sm:text-xl mb-3 sm:mb-5">
          {getPriceDisplay()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        <Link
          href={`/product/${product.id}`}
          className="w-full py-3 px-4 bg-[#0F4C5C] hover:bg-[#0B3A46] text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_4px_15px_rgba(15,76,92,0.2)] flex items-center justify-center cursor-pointer text-center"
        >
          <span>Lihat Detail & Varian</span>
        </Link>
      </div>
    </div>
  );
};
