'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, AlertCircle, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { lockBodyScroll } from '@/lib/scrollLock';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register'; // Dipertahankan agar tidak error di Header.tsx
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll(true, 'auth');
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
      
      setEmail('');
      setAuthStep('email');
      setOtpCode('');
      setErrorMsg(null);
      setInfoMsg(null);
      setCaptchaToken(null);
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        lockBodyScroll(false, 'auth');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => lockBodyScroll(false, 'auth');
  }, []);

  if (!isRendered) return null;

  const getRedirectUrl = () => {
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      'http://localhost:3000';
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    return url.endsWith('/') ? `${url}auth/callback` : `${url}/auth/callback`;
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'linkedin_oidc') => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/popup-callback`,
        },
      });

      if (error) throw new Error(error.message);
      
      if (data?.url) {
        const width = 500;
        const height = 600;
        const left = typeof window !== 'undefined' ? window.screenX + (window.outerWidth - width) / 2 : 0;
        const top = typeof window !== 'undefined' ? window.screenY + (window.outerHeight - height) / 2 : 0;
        
        const popup = window.open(
          data.url,
          'SupabaseAuthPopup',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data === 'AUTH_SUCCESS') {
            window.removeEventListener('message', messageListener);
            window.location.reload(); 
          }
        };
        
        window.addEventListener('message', messageListener);

        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            setIsLoading(false);
          }
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Gagal login dengan ${provider}.`);
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY && !captchaToken) {
      setErrorMsg('Silakan selesaikan centang keamanan (CAPTCHA) terlebih dahulu ya.');
      return;
    }

    setIsLoading(true);

    try {
      // Hanya menyisakan Magic Link (OTP)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl(),
          captchaToken: captchaToken || undefined,
        },
      });
      
      if (error) throw error;
      setInfoMsg('Kode OTP dan tautan ajaib telah dikirim ke emailmu. Cek folder spam juga ya.');
      setAuthStep('otp');
      
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaToken(null);
      
    } catch (err: any) {
      console.error("Auth error details:", err);
      
      let rawMsg = "";
      if (err && typeof err === "object") {
        rawMsg = err.message || err.error_description || "";
        if (!rawMsg && err.error) {
          rawMsg = typeof err.error === "string" ? err.error : JSON.stringify(err.error);
        }
      } else if (typeof err === "string") {
        rawMsg = err;
      }

      if (!rawMsg || rawMsg === "{}" || rawMsg === "[object Object]") {
        rawMsg = "Terjadi kendala jaringan. Pastikan koneksi lancar dan tidak diblokir adblocker.";
      }
      
      rawMsg = String(rawMsg); 
      const lowerMsg = rawMsg.toLowerCase();

      if (lowerMsg.includes('rate limit') || lowerMsg.includes('security purposes') || lowerMsg.includes('too many requests') || lowerMsg.includes('email_rate_limit_exceeded')) {
        setErrorMsg('Terlalu cepat! Silakan tunggu sekitar 60 detik sebelum mengirim ulang ya.');
      } else if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('authretryablefetcherror')) {
        setErrorMsg('Koneksi ke server terputus. Harap matikan Adblocker atau gunakan koneksi lain.');
      } else {
        setErrorMsg(rawMsg);
      }

      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) throw error;
      if (data?.session) {
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Kode OTP salah atau sudah kadaluarsa.');
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
        
        <div className="h-2 w-full bg-gradient-to-r from-pink-300 via-pink-400 to-pink-200" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-slate-100 hover:bg-pink-50 text-slate-500 hover:text-pink-500 transition-all duration-300 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-pink-200 bg-white flex items-center justify-center overflow-hidden shrink-0 mx-auto mb-3.5 shadow-sm">
              <img src="/images/logoNEW.webp" alt="Simoengil Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-heading">
              Masuk ke Akun
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
              Kami akan mengirimkan link ajaib ke emailmu.
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Gagal memproses</span>
                <p className="leading-relaxed font-medium">{errorMsg}</p>
              </div>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-emerald-700 text-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Pemberitahuan</span>
                <p className="leading-relaxed font-medium">{infoMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
          {authStep === 'email' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* hCaptcha Component */}
              {process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY && (
                <div className="flex justify-center py-2 px-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden w-full animate-in fade-in zoom-in-95 duration-200">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    languageOverride="id"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!!process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY && !captchaToken)}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kirim Link Login</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">
                  Masukkan 6-Digit Kode OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-4 text-center text-3xl tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-300"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-500 mt-2">
                  Atau buka email di HP Anda dan klik tombol <b>"Log in"</b> secara langsung.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('email');
                    setOtpCode('');
                  }}
                  disabled={isLoading}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center shrink-0"
                  title="Kembali Edit Email"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex-1 py-3 bg-[#D48C70] hover:bg-[#C27D62] text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verifikasi OTP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Social Logins */}
          {authStep === 'email' && (
            <div className="mt-4">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Atau masuk dengan</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center py-2.5 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                title="Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('facebook')}
                className="flex items-center justify-center py-2.5 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                title="Facebook"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
            
            <p className="text-[9px] sm:text-[10px] text-slate-400 text-center leading-relaxed font-medium mt-4">
              Dengan masuk, kamu menyetujui <a href="/privacy" className="text-pink-500 hover:underline">Kebijakan Privasi</a> dan <a href="/terms" className="text-pink-500 hover:underline">Syarat Layanan</a> kami.
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
