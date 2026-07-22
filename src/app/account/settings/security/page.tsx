"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Loader2, Smartphone, KeyRound, AlertCircle, CheckCircle2, ShieldAlert, Lock } from "lucide-react";

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [factors, setFactors] = useState<any[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [totpData, setTotpData] = useState<{ id: string; qr_code: string; secret: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data.totp || []);
    } catch (error: any) {
      console.error("Gagal mengambil status 2FA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setMessage(null);
    try {
      const { data: listData } = await supabase.auth.mfa.listFactors();
      const unverified = (listData?.totp || listData?.all || []).filter((f: any) => f.status === 'unverified');
      for (const factor of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Simoengil 2FA - ${new Date().getTime()}`
      });
      if (error) throw error;

      setTotpData({
        id: data.id,
        qr_code: data.totp.uri,
        secret: data.totp.secret,
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menyiapkan 2FA.' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpData) return;
    setIsEnrolling(true);
    setMessage(null);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: totpData.id });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: totpData.id,
        challengeId: challenge.data.id,
        code: verifyCode
      });

      if (verify.error) throw verify.error;

      setMessage({ type: 'success', text: 'Autentikasi Dua Langkah (2FA) berhasil diaktifkan!' });
      setTotpData(null);
      setVerifyCode("");
      fetchFactors();

    } catch (error: any) {
      setMessage({ type: 'error', text: 'Kode salah atau kedaluwarsa. Silakan coba lagi.' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (factorId: string) => {
    if (!window.confirm("Yakin ingin mematikan 2FA? Akun Anda akan lebih rentan.")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setMessage({ type: 'success', text: '2FA telah dimatikan.' });
      fetchFactors();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mematikan 2FA.' });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Memuat pengaturan keamanan...</p>
      </div>
    );
  }

  const activeTotp = factors.find(f => f.status === 'verified');

  return (
    <div className="max-w-3xl space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-pink-500" />
            Keamanan Akun
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Lindungi akun dan transaksi Simoengil Anda dengan autentikasi ekstra.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border shadow-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50/80 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      {/* 2FA SECTION CARD */}
      <div className="pt-2">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3.5 rounded-2xl shrink-0 ${activeTotp ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'}`}>
            {activeTotp ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              Autentikasi Dua Langkah (2FA)
              {activeTotp ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold rounded-full shadow-sm">
                  Aktif ✓
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200/70 text-slate-600 text-xs font-bold rounded-full">
                  Belum Aktif
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-lg font-medium">
              Tambahkan lapisan keamanan ganda pada akun Anda. Setiap kali login, Anda akan diminta memasukkan kode 6 digit dari aplikasi Authenticator (seperti Google Authenticator) di smartphone Anda.
            </p>
          </div>
        </div>

        {activeTotp ? (
          <div className="pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-xs sm:text-sm font-bold text-slate-700">Aplikasi Authenticator saat ini aktif dan terhubung.</span>
            <button
              onClick={() => handleUnenroll(activeTotp.id)}
              className="px-5 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow"
            >
              Matikan 2FA
            </button>
          </div>
        ) : totpData ? (
          <div className="pt-5 border-t border-slate-200/80">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 text-center">
              <h4 className="text-base font-bold text-slate-900 mb-2">1. Scan QR Code ini</h4>
              <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
                Buka aplikasi Google Authenticator / Authy di HP Anda, lalu scan QR Code di bawah:
              </p>
              
              <div className="inline-block bg-white p-4 border-2 border-slate-100 rounded-3xl shadow-md mb-5">
                <QRCodeSVG value={totpData.qr_code} size={170} />
              </div>
              
              <div className="mb-6">
                <p className="text-xs text-slate-400 mb-1.5 font-medium">Atau masukkan kode rahasia ini secara manual:</p>
                <code className="bg-slate-100 border border-slate-200 text-slate-800 px-3.5 py-1.5 rounded-xl text-xs tracking-widest font-mono select-all font-bold">
                  {totpData.secret}
                </code>
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-3 border-t border-slate-100 pt-6">2. Masukkan Kode Verifikasi</h4>
              <form onSubmit={handleVerify} className="max-w-xs mx-auto space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-mono tracking-[0.4em] text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-slate-300 placeholder:tracking-normal font-bold shadow-inner"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTotpData(null)}
                    disabled={isEnrolling}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-sm transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isEnrolling || verifyCode.length !== 6}
                    className="flex-1 py-3 bg-slate-900 hover:bg-pink-500 text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                  >
                    {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="pt-5 border-t border-slate-200/80">
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-pink-500 text-white font-bold text-sm rounded-full shadow-lg shadow-slate-900/20 hover:shadow-pink-500/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              <span>Aktifkan 2FA Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
