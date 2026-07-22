"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, User, ShieldCheck, Bell, Sparkles, Settings, ChevronRight } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Profil Saya", path: "/account/settings/profile", icon: User },
    { name: "Keamanan Akun", path: "/account/settings/security", icon: ShieldCheck },
    { name: "Notifikasi", path: "/account/settings/notifications", icon: Bell },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 px-2 sm:px-0">
        <Link href="/" className="hover:text-pink-500 transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link href="/account" className="hover:text-pink-500 transition-colors">Akun</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800">Pengaturan</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR NAVIGATION (Desktop) & TABS (Mobile) */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="md:sticky md:top-24">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight mb-2 px-2 sm:px-0">
              Pengaturan
            </h1>
            <p className="text-slate-500 text-sm font-medium mb-6 px-2 sm:px-0 hidden md:block">
              Kelola preferensi akun Anda
            </p>

            <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar px-2 sm:px-0 pb-2 md:pb-0 border-b md:border-b-0 border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap group ${
                      isActive
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-white/20" : "bg-white shadow-sm border border-slate-200/60 group-hover:border-slate-300"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-pink-500"}`} />
                    </div>
                    <span>{item.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto hidden md:block opacity-50" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN SETTINGS CONTENT AREA */}
        <main className="flex-1 min-w-0">
          <div className="bg-white md:rounded-3xl p-6 sm:p-8 md:shadow-sm md:border border-slate-200/60 min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
