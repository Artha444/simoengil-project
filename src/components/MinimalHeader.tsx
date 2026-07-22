"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, User, ArrowLeft, ShieldCheck, Sparkles, LogOut, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WishlistDrawer } from "./WishlistDrawer";
import { useRouter } from "next/navigation";

export default function MinimalHeader() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  useEffect(() => {
    // Cart
    const loadCart = () => {
      const savedCart = localStorage.getItem("simoengil_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to load cart", e);
        }
      }
    };
    loadCart();

    window.addEventListener("storage", (e) => {
      if (e.key === "simoengil_cart") loadCart();
    });
    window.addEventListener("cart_updated", loadCart);

    // Auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        if (session.user?.user_metadata?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };
    checkAuth();

    return () => {
      window.removeEventListener("cart_updated", loadCart);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updated = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
  };

  return (
    <>
      <header className="w-full bg-[#FFFBF9] border-b border-pink-100 sticky top-0 z-40 shadow-sm">
        {/* Admin Bar (if admin) */}
        {isAdmin && (
          <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-pink-500/20 text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 py-2 px-4 sm:px-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-pink-500/20 rounded-full shrink-0">
                  <Sparkles className="text-pink-400 animate-pulse w-3 h-3" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-300">
                  Masuk sebagai <span className="text-pink-300 font-black tracking-widest uppercase">Admin</span>
                </p>
              </div>
              <Link
                href="/admin-panel/dashboard"
                className="inline-flex items-center gap-1.5 bg-pink-500 hover:bg-pink-400 text-white text-[10px] font-bold py-1 px-3 rounded-full transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> 
                <span>Buka Panel</span>
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center overflow-hidden shrink-0">
              <img src="/images/logoNEW.webp" alt="Simoengil Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-magilio text-2xl sm:text-3xl text-[#4A3B32] group-hover:text-[#FFB6C8] transition-colors leading-none tracking-tight">
              Simoengil.
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full font-bold text-xs transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={(p: any) => {
          setIsWishlistOpen(false);
          window.location.href = `/product/${p.id}`;
        }}
        isLoggedIn={!!user}
        onAuthRequired={() => window.location.href = "/"} // Fallback, no AuthModal here since we are in account
      />
    </>
  );
}
