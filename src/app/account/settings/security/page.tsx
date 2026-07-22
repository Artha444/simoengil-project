"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Loader2, Smartphone, KeyRound, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

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
      // Bersihkan faktor yang belum terverifikasi jika ada di list (optional cleanup)
      const { data: listData } = await supabase.auth.mfa.listFactors();
      const unverified = (listData?.totp || listData?.all || []).filter((f: any) => f.status === 'unverified');
      for (const factor of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      // Gunakan penanda waktu agar namanya selalu unik jika user klik berkali-kali
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Simoengil 2FA - ${new Date().getTime()}`
      });
      if (error) throw error;

      setTotpData({
        id: data.id,
        qr_code: data.totp.uri, // Menggunakan URI (otpauth://...) untuk di-generate oleh qrcode.react
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
      fetchFactors(); // Refresh list

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  const activeTotp = factors.find(f => f.status === 'verified');

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 font-heading">Keamanan Akun</h2>
        <p className="text-sm text-slate-500 mt-1">
          Lindungi akun Anda dengan fitur keamanan ekstra.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* 2FA Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-2xl shrink-0 ${activeTotp ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {activeTotp ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Autentikasi Dua Langkah (2FA)
              {activeTotp && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Aktif
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Tambahkan lapisan keamanan ganda. Setiap kali login, Anda akan diminta memasukkan kode 6 digit dari aplikasi Authenticator di HP Anda.
            </p>
          </div>
        </div>

        {activeTotp ? (
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Aplikasi Authenticator tersambung.</span>
            <button
              onClick={() => handleUnenroll(activeTotp.id)}
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs sm:text-sm transition-colors"
            >
              Matikan 2FA
            </button>
          </div>
        ) : totpData ? (
          <div className="pt-4 border-t border-slate-200">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
              <h4 className="text-sm font-bold text-slate-800 mb-4">1. Scan QR Code ini</h4>
              <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
                Buka aplikasi seperti Google Authenticator atau Authy, lalu arahkan kamera ke barcode berikut:
              </p>
              
              <div className="inline-block bg-white p-3 border-2 border-slate-100 rounded-2xl shadow-sm mb-4">
                <QRCodeSVG value={totpData.qr_code} size={160} />
              </div>
              
              <div className="mb-6">
                <p className="text-xs text-slate-400 mb-1">Atau masukkan kode rahasia ini manual:</p>
                <code className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs tracking-widest font-mono select-all">
                  {totpData.secret}
                </code>
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-3 border-t border-slate-100 pt-6">2. Verifikasi Kode</h4>
              <form onSubmit={handleVerify} className="max-w-xs mx-auto space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-mono tracking-[0.5em] text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-300 placeholder:tracking-normal"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTotpData(null)}
                    disabled={isEnrolling}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isEnrolling || verifyCode.length !== 6}
                    className="flex-1 py-2.5 bg-[#FF8FB1] hover:bg-[#ff7a9f] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              Aktifkan 2FA Sekarang
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
