import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart, Trash2, Smile, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, Product } from '@/data/products';
import { lockBodyScroll } from '@/lib/scrollLock';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onDetailClick: (product: Product) => void;
  isLoggedIn?: boolean;
  onAuthRequired?: () => void;
  drawerCartIconRef?: React.RefObject<HTMLDivElement | null>;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onDetailClick,
  isLoggedIn = false,
  onAuthRequired,
  drawerCartIconRef,
}) => {
  const router = useRouter();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll(true, 'wishlist');
      setIsRendered(true);
      const t = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(t);
    } else {
      lockBodyScroll(false, 'wishlist');
      setIsAnimating(false);
      const t = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCheckoutAll = () => {
    if (cartItems.length === 0) return;
    if (!isLoggedIn) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    onClose();
    router.push('/checkout?mode=cart');
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.selectedPrice * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#0A0F1D]/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel */}
        <div
          className={`w-screen max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-l border-pink-100/50 flex flex-col justify-between transition-transform duration-300 ease-out ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-pink-100/50 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
              <div ref={drawerCartIconRef} className="p-2.5 rounded-xl bg-gradient-to-br from-pink-100 to-orange-100 border border-pink-200 text-[#FF8FB1] shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#2C2C2C] text-lg tracking-tight">Keranjang Belanja</h3>
                <p className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">{totalItemCount} Barang</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-[#FFF5F0] text-slate-400 hover:text-[#FF8FB1] transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-50 to-orange-50 flex items-center justify-center border border-pink-100 text-[#FF8FB1] shadow-inner">
                  <Smile className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-black text-[#2C2C2C] text-lg">Keranjang Kosong</h4>
                  <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-2 leading-relaxed">
                    Yuk, cari boneka favoritmu di katalog dan masukkan ke keranjang untuk diadopsi!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-4 py-3 px-8 bg-[#0F4C5C] hover:bg-[#0B3A46] text-white rounded-2xl text-xs font-black transition-all shadow-[0_4px_15px_rgba(15,76,92,0.2)] hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Jelajahi Katalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="relative flex gap-4 p-4 rounded-[1.5rem] border border-pink-100/50 hover:border-[#FFB6C8] bg-white hover:bg-[#FFF8F3]/50 transition-all group shadow-sm hover:shadow-md pr-10"
                >
                  {/* Remove Button (X) placed at top right */}
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                    aria-label="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Thumbnail */}
                  <div
                    className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 cursor-pointer border border-pink-50"
                    onClick={() => {
                      onDetailClick(item);
                      onClose();
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                    <div className="pr-2">
                      <h4
                        className="font-bold text-[#2C2C2C] text-sm hover:text-[#FF8FB1] transition-colors line-clamp-2 cursor-pointer leading-tight pr-2"
                        onClick={() => {
                          onDetailClick(item);
                          onClose();
                        }}
                      >
                        {item.name}
                      </h4>
                      {(item.selectedVariantType || item.selectedVariantSize) && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {item.selectedVariantType && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
                              {item.selectedVariantType}
                            </span>
                          )}
                          {item.selectedVariantSize && (
                            <span className="text-[9px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-md">
                              {item.selectedVariantSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity Aligned */}
                    <div className="flex items-center justify-between mt-3 w-full">
                      <p className="text-sm text-[#FF8FB1] font-black truncate pr-2">
                        {formatIDR(item.selectedPrice)}
                      </p>

                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                          className="p-1.5 text-slate-500 hover:bg-[#FF8FB1] hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-700 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                          className="p-1.5 text-slate-500 hover:bg-[#FF8FB1] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-pink-100/50 space-y-4 bg-white/80 backdrop-blur-md">
              <div className="flex justify-between items-end mb-4 px-1">
                <span className="text-sm font-bold text-slate-500">Total Belanja</span>
                <span className="text-xl font-black text-[#FF8FB1]">{formatIDR(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckoutAll}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] hover:from-[#FFB6C8] hover:to-[#FF8FB1] text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Beli Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-slate-100 hover:border-pink-100 text-slate-500 hover:text-[#FF8FB1] hover:bg-[#FFF5F0] rounded-2xl font-bold text-sm transition-all text-center cursor-pointer active:scale-95"
              >
                Lanjutkan Belanja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
