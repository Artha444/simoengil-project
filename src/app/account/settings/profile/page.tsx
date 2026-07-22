"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, UserCircle, Camera, CheckCircle2, AlertCircle, User, AtSign, Mail, Trash2, Sparkles } from "lucide-react";

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    avatar_url: "",
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return;

      setUserId(session.user.id);
      setEmail(session.user.email || "");

      // Fetch from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        setFormData({
          username: "",
          display_name: session.user.user_metadata?.full_name || "",
          avatar_url: session.user.user_metadata?.avatar_url || "",
        });
      } else {
        setFormData({
          username: profile.username || "",
          display_name: profile.display_name || "",
          avatar_url: profile.avatar_url || "",
        });
      }
    } catch (error: any) {
      console.error("Gagal mengambil profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Format file tidak didukung. Harap unggah gambar.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 2MB.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar');

      setFormData({ ...formData, avatar_url: data.url });
      setMessage({ type: 'success', text: 'Foto berhasil diunggah! Klik Simpan Perubahan untuk mengkonfirmasi.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat mengunggah foto.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      // Upsert to profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: formData.username || null,
          display_name: formData.display_name,
          avatar_url: formData.avatar_url
        });

      if (error) throw error;

      // Also update auth.users metadata
      await supabase.auth.updateUser({
        data: {
          full_name: formData.display_name,
          avatar_url: formData.avatar_url
        }
      });

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (error: any) {
      let errorMsg = error.message;
      if (error.code === '23505') {
        errorMsg = 'Username tersebut sudah dipakai orang lain. Silakan pilih username unik lainnya.';
      } else if (errorMsg.includes('Banned words') || errorMsg.includes('dilarang')) {
        errorMsg = 'Username mengandung kata yang dilarang.';
      }
      
      setMessage({ type: 'error', text: errorMsg || 'Gagal menyimpan profil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarStyle = (emailStr: string) => {
    const colors = [
      'from-emerald-400 to-teal-500',
      'from-cyan-400 to-blue-500',
      'from-indigo-400 to-violet-500',
      'from-fuchsia-400 to-pink-500',
      'from-rose-400 to-red-500',
      'from-orange-400 to-amber-500',
      'from-sky-400 to-indigo-500'
    ];
    let hash = 0;
    for (let i = 0; i < emailStr.length; i++) {
      hash = emailStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return `bg-gradient-to-br ${colors[index]}`;
  };

  const getInitials = (name?: string, emailStr?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 1).toUpperCase();
    }
    if (emailStr) {
      return emailStr.substring(0, 1).toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-pink-500" />
            Informasi Profil Saya
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Kelola foto profil dan identitas tampilan publik kamu di Simoengil.
          </p>
        </div>
      </div>

      {/* Alert Notifications */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AVATAR SECTION CARD */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <label className="relative group cursor-pointer shrink-0">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
            <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl ring-4 ring-slate-50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 ${!formData.avatar_url ? getAvatarStyle(email) : 'bg-slate-50'}`}>
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-white text-3xl sm:text-4xl tracking-tighter drop-shadow-md">
                  {getInitials(formData.display_name, email)}
                </span>
              )}
            </div>
            <div className={`absolute inset-0 rounded-full transition-opacity flex items-center justify-center ${isUploading ? 'bg-black/60 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-white">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-bold">Ubah Foto</span>
                </div>
              )}
            </div>
          </label>

          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
              Foto Profil Utama
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Klik pada lingkaran foto di samping untuk mengunggah gambar dari perangkat kamu (Format JPG/PNG, Maks. 2MB).
            </p>
            {formData.avatar_url && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatar_url: '' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200/60 mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Foto
              </button>
            )}
          </div>
        </div>

        {/* INPUT FIELDS CARD */}
        <div className="space-y-6 pt-2">
          {/* Email (Disabled) */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Alamat Email (Akun)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-slate-200/60 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed select-none"
            />
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Email adalah identitas masuk utama Anda dan tidak dapat diubah di sini.</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-pink-500" />
              Nama Tampilan
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Contoh: Artha Gemoy"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-slate-300 shadow-sm"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-pink-500" />
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="arthagemoy"
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Hanya huruf, angka, dan garis bawah (_). Batas perubahan 1x per 30 hari.
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-pink-500 text-white font-bold text-sm rounded-full shadow-lg shadow-slate-900/20 hover:shadow-pink-500/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
