'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Heart, Trash2, ShoppingCart, Smile } from 'lucide-react';
import { Product } from '@/data/products';
import confetti from 'canvas-confetti';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveItem: (id: string) => void;
  onDetailClick: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveItem,
  onDetailClick,
}) => {
  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCheckoutAll = () => {
    if (wishlistItems.length === 0) return;
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff8fa3', '#fff3b0', '#a8dadc', '#ff4d6d'],
    });
    // Open Shopee as default or prompt
    window.open('https://shopee.co.id', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-pink-100 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-blue-50 flex items-center justify-between bg-blue-50/20">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-50 border border-pink-100 text-pink-500">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Teman Impianku</h3>
                <p className="text-xs text-slate-500">{wishlistItems.length} plushie disimpan</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-300 animate-float">
                  <Smile className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-base">Belum Ada Teman Peluk</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Cari boneka favoritmu di katalog dan klik ikon hati untuk menyimpannya di sini!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  Jelajahi Katalog
                </button>
              </div>
            ) : (
              wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-2xl border border-blue-50 hover:border-pink-100 bg-white hover:bg-pink-50/10 transition-all group"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 cursor-pointer"
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
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="font-bold text-slate-800 text-sm hover:text-pink-500 transition-colors line-clamp-1 cursor-pointer"
                        onClick={() => {
                          onDetailClick(item);
                          onClose();
                        }}
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs text-pink-500 font-extrabold mt-0.5">
                        {formatIDR(item.price)}
                      </p>
                    </div>

                    {/* Actions inside Item */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          onDetailClick(item);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-pink-500 hover:underline transition-all cursor-pointer"
                      >
                        Detail
                      </button>
                      <span className="text-slate-300 text-xs">•</span>
                      <button
                        onClick={() => window.open(item.shopeeLink, '_blank')}
                        className="text-[11px] font-bold text-orange-600 hover:underline transition-all cursor-pointer"
                      >
                        Shopee
                      </button>
                      <span className="text-slate-300 text-xs">•</span>
                      <button
                        onClick={() => window.open(item.tokopediaLink, '_blank')}
                        className="text-[11px] font-bold text-green-600 hover:underline transition-all cursor-pointer"
                      >
                        Tokopedia
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="self-center p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                    aria-label="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {wishlistItems.length > 0 && (
            <div className="p-6 border-t border-blue-50 space-y-3 bg-blue-50/10">
              <button
                onClick={handleCheckoutAll}
                className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-pink-500/10 hover:shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Beli Semua di Shopee</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-all text-center cursor-pointer"
              >
                Lanjutkan Jelajah
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
