'use client';

import React, { useEffect } from 'react';
import { X, Lock, AlertCircle, ShoppingBag, Heart } from 'lucide-react';
import { lockBodyScroll } from '@/lib/scrollLock';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  onConfirm,
}: LoginRequiredModalProps) {
  useEffect(() => {
    lockBodyScroll(isOpen, 'login-required');
    return () => lockBodyScroll(false, 'login-required');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0F1D]/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-pink-100/50 flex flex-col transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative top pattern */}
        <div className="h-2 w-full bg-gradient-to-r from-pink-300 via-pink-400 to-amber-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-[#FFF5F0] text-slate-500 hover:text-[#FF8FB1] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Body Content */}
        <div className="p-8 text-center flex flex-col items-center">
          
          {/* Animated Cute Icon */}
          <div className="relative w-20 h-20 rounded-full bg-pink-50 border border-pink-100/50 flex items-center justify-center text-[#FF8FB1] mb-6 shadow-inner animate-float">
            <div className="absolute inset-0 rounded-full bg-pink-100/30 animate-ping opacity-75" />
            <span className="text-4xl z-10">🧸</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-heading font-black text-slate-800 tracking-tight leading-snug">
            Oops! Kamu Belum Masuk
          </h3>

          {/* Message */}
          <p className="text-slate-500 text-xs sm:text-sm mt-3 font-medium leading-relaxed max-w-[280px]">
            Mohon login terlebih dahulu untuk melakukan pembelian boneka gemoy Simoengil.
          </p>

          {/* CTA Buttons */}
          <div className="w-full space-y-3.5 mt-8">
            <button
              onClick={() => {
                onClose();
                onConfirm();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] hover:from-[#FFB6C8] hover:to-[#FF8FB1] text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4.5 h-4.5" />
              <span>Login / Register Sekarang</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 border border-slate-200 hover:border-pink-100 text-slate-500 hover:text-[#FF8FB1] hover:bg-[#FFF5F0] rounded-2xl font-bold text-xs transition-all text-center cursor-pointer active:scale-[0.98]"
            >
              Nanti Saja
            </button>
          </div>
        </div>

        {/* Footer info decoration */}
        <div className="py-3 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400">
          <Heart className="w-3.5 h-3.5 text-[#FF8FB1] fill-[#FF8FB1]" />
          <span>Selamat mengadopsi boneka impianmu!</span>
        </div>
      </div>
    </div>
  );
}
