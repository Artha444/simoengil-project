"use client";

import React from "react";
import { BellRing } from "lucide-react";

export default function NotificationsSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 font-heading">Notifikasi</h2>
        <p className="text-sm text-slate-500 mt-1">
          Atur preferensi pemberitahuan Anda.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 border border-slate-100 rounded-3xl border-dashed">
        <div className="w-16 h-16 bg-[#FFF5F0] text-[#FF8FB1] rounded-full flex items-center justify-center mb-4">
          <BellRing className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">Segera Hadir</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Fitur pengaturan notifikasi email dan push notification sedang dalam tahap pengembangan.
        </p>
      </div>
    </div>
  );
}
