"use client";

import React from "react";
import { BellRing, Bell } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-pink-500" />
            Preferensi Notifikasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Atur bagaimana kamu menerima informasi promo, status pesanan, dan update Simoengil.
          </p>
        </div>
      </div>

      {/* EMPTY STATE / COMING SOON CARD */}
      <div className="pt-2 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 rounded-t-3xl opacity-50"></div>
        
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 text-pink-500 rounded-full flex items-center justify-center text-3xl mb-5 border-4 border-white shadow-md relative z-10">
          <BellRing className="w-9 h-9 animate-bounce" />
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-2">Segera Hadir!</h3>
        <p className="text-slate-500 max-w-md text-xs sm:text-sm font-medium leading-relaxed">
          Fitur pengaturan notifikasi email dan pemberitahuan langsung di aplikasi sedang kami kembangkan untuk pengalaman berbelanja yang lebih menyenangkan.
        </p>
      </div>
    </div>
  );
}
