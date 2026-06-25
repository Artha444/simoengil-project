'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SecureAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Explicitly check for admin role
      const userRole = data.user?.user_metadata?.role;
      if (userRole !== 'admin') {
        // Log them out immediately if they are not an admin
        await supabase.auth.signOut();
        throw new Error('Akses ditolak: Anda tidak memiliki hak akses sebagai admin.');
      }

      // Successful login redirect
      router.push('/admin-panel/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Return to home button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-pink-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Toko</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Icon Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-pink-100/80 border border-pink-200/50 flex items-center justify-center text-pink-500 mx-auto mb-3 shadow-md shadow-pink-500/5">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Sistem Keamanan Tingkat Lanjut</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-150 shadow-xl shadow-slate-100 overflow-hidden p-8 space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <div className="space-y-1">
                <span className="font-extrabold block">Gagal Masuk</span>
                <p className="leading-relaxed font-medium">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@simoengil.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-slate-800/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <span>Masuk Sistem</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-8 font-medium">
          &copy; 2026 Boneka Simoengil. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
