"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Shield, Bell, ChevronLeft, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace("/");
        return;
      }
      
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const navItems = [
    { name: "Profil", path: "/account/settings/profile", icon: User },
    { name: "Keamanan", path: "/account/settings/security", icon: Shield },
    { name: "Notifikasi", path: "/account/settings/notifications", icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF8FB1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF9] font-sans">
      <Header />
      
      <main className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 sticky top-28">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Pengaturan</h1>
                <Link href="/dashboard" className="text-xs text-slate-400 flex items-center gap-1 hover:text-[#FF8FB1] transition-colors">
                  <ChevronLeft className="w-3 h-3" />
                  Kembali
                </Link>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${
                        isActive 
                          ? "bg-[#FFF5F0] text-[#FF8FB1] shadow-inner border border-[#FFB6C8]/30" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "text-[#FF8FB1]" : "text-slate-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <hr className="my-6 border-slate-100" />
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-2xl transition-all font-medium text-sm text-rose-500 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[500px]">
              {children}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
