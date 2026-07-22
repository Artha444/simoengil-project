"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, UserCircle, Camera, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        // Jika belum ada di tabel profiles, ini wajar jika trigger DB belum berjalan untuk user lama
        // Kita gunakan metadata bawaan
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

      // Also update auth.users metadata for backward compatibility (optional but good practice)
      await supabase.auth.updateUser({
        data: {
          full_name: formData.display_name,
          avatar_url: formData.avatar_url
        }
      });

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (error: any) {
      // Error handling yang manusiawi, mengambil error message dari Postgres Trigger
      let errorMsg = error.message;
      if (error.code === '23505') { // Unique violation
        errorMsg = 'Username tersebut sudah dipakai orang lain. Silakan pilih yang lain.';
      } else if (errorMsg.includes('Banned words') || errorMsg.includes('dilarang')) {
        errorMsg = 'Username mengandung kata yang dilarang.';
      }
      
      setMessage({ type: 'error', text: errorMsg || 'Gagal menyimpan profil.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 font-heading">Profil Saya</h2>
        <p className="text-sm text-slate-500 mt-1">
          Kelola informasi identitas publik Anda.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full border-4 border-slate-50 bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-slate-300" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Foto Profil</h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">Gunakan URL gambar valid (JPG, PNG).</p>
            <input
              type="text"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
              Email (Tidak bisa diubah di sini)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
              Nama Tampilan (Display Name)
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Tulis nama lengkap/panggilan"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
              Username Unik
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="simoengil_lover"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Batas perubahan 1x per 30 hari. 3-20 Karakter huruf/angka/underscore.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#FF8FB1] hover:bg-[#ff7a9f] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
