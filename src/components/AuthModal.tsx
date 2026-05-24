'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, AlertCircle, Heart, Sparkles, Smile, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state
      setEmail('');
      setPassword('');
      setName('');
      setErrorMsg(null);
      setInfoMsg(null);
      setMode(initialMode);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

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
        className="absolute inset-0 bg-[#0A0F1D]/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-pink-100/50 flex flex-col transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        
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

          {/* OAuth Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-3 text-[9px] font-black text-slate-400 bg-white uppercase tracking-widest">
              Atau masuk dengan
            </span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/20 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.2662 9.7651c-.2611-.7841-.4091-1.6231-.4091-2.5021 0-.879.148-1.718.4091-2.502L1.3142 1.63C.4741 3.298 0 5.173 0 7.163c0 2.09.52 4.053 1.433 5.787l3.8332-3.1849z"
              />
              <path
                fill="#FBBC05"
                d="M16.04 15.345c-2.451 1.564-5.502 2.088-8.74 1.484-1.242-.232-2.399-.747-3.414-1.488L1.3142 18.526c2.09 1.517 4.674 2.4 7.4588 2.4 4.053 0 7.649-1.892 9.947-4.831l-2.68-2.09-.0002-.135z"
              />
              <path
                fill="#4285F4"
                d="M23.745 7.163c0-.8-.07-1.58-.2-2.33h-11.55v4.61h6.63c-.29 1.52-1.15 2.81-2.45 3.68l2.68 2.09c2.31-2.13 3.89-5.34 3.89-8.05z"
              />
              <path
                fill="#34A853"
                d="M11.995 4.783c1.73 0 3.29.6 4.51 1.77l3.39-3.39C17.845 1.253 15.115.5 11.995.5 8.163.5 4.873 2.653 3.197 5.795l3.952 3.076c.783-2.38 3.013-4.088 4.846-4.088z"
              />
            </svg>
            <span>Google Sign-In</span>
          </button>

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
