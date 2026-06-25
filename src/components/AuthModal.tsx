'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, AlertCircle, Heart, Sparkles, Smile, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { lockBodyScroll } from '@/lib/scrollLock';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll(true, 'auth');
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
      
      setEmail('');
      setPassword('');
      setName('');
      setErrorMsg(null);
      setInfoMsg(null);
      setMode(initialMode);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        lockBodyScroll(false, 'auth');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    return () => lockBodyScroll(false, 'auth');
  }, []);

  if (!isRendered) return null;

  const getRedirectUrl = () => {
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      'http://localhost:3000';
    
    // Ensure protocol is present
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    // Clean trailing slash
    return url.endsWith('/') ? url : `${url}/`;
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) throw new Error(error.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login dengan Google.');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;

        // Check if confirmation is required
        if (data.user && data.session === null) {
          setInfoMsg('Email konfirmasi pendaftaran telah dikirim! Silakan periksa inbox/spam email Anda untuk memverifikasi akun.');
        } else {
          setInfoMsg('Pendaftaran berhasil! Akun Anda siap digunakan.');
          if (onSuccess) onSuccess();
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#0A0F1D]/45 backdrop-blur-xs transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-pink-100/50 flex flex-col transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
        
        {/* Decorative Top Border */}
        <div className="h-2 w-full bg-gradient-to-r from-pink-300 via-pink-400 to-amber-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-slate-100 hover:bg-[#FFF5F0] text-slate-500 hover:text-[#FF8FB1] transition-all duration-300 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-8 flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF5F0] border border-[#FFB6C8]/40 flex items-center justify-center text-[#FF8FB1] mx-auto mb-3.5 shadow-sm">
              <Smile className="w-7 h-7 text-[#E8B37D]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-heading">
              {mode === 'login' ? 'Masuk ke Simoengil' : 'Buat Akun Teman Peluk'}
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
              {mode === 'login'
                ? 'Yuk masuk untuk mengadopsi boneka gemoy favoritmu!'
                : 'Daftar sekarang untuk melacak pesanan dan kelola wishlist boneka impian.'}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Gagal memproses</span>
                <p className="leading-relaxed font-medium">{errorMsg}</p>
              </div>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-emerald-700 text-xs">
              <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Pemberitahuan</span>
                <p className="leading-relaxed font-medium">{infoMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Smile className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Artha Gemoy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF8FB1] hover:bg-[#ff7a9f] text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Login Button - Hidden because it's not configured in Supabase */}

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            {mode === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#FF8FB1] hover:text-[#ff7a9f] font-bold cursor-pointer focus:outline-none"
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#FF8FB1] hover:text-[#ff7a9f] font-bold cursor-pointer focus:outline-none"
                >
                  Masuk di sini
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
