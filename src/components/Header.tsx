"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Home,
  Grid,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { WishlistDrawer } from "./WishlistDrawer";
import AuthModal from "./AuthModal";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load auth & cart state
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

    // Check cart periodically for changes across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "simoengil_cart") loadCart();
    });

    // Listen to same-window cart updates
    window.addEventListener("cart_updated", loadCart);

    // Override localStorage.setItem to dispatch custom event
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'simoengil_cart') {
        window.dispatchEvent(new Event('cart_updated'));
      }
    };

    // Auth
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        if (session.user?.user_metadata?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
          if (session.user?.user_metadata?.role === "admin") {
            setIsAdmin(true);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener("cart_updated", loadCart);
      if (localStorage.setItem !== originalSetItem) {
        localStorage.setItem = originalSetItem;
      }
    };
  }, []);

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

  // Close mobile menu when pathname changes or chat opens
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleChatOpened = () => setIsMobileMenuOpen(false);
    window.addEventListener('chat_opened', handleChatOpened);
    return () => window.removeEventListener('chat_opened', handleChatOpened);
  }, []);

  const handleFaqClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "#faq");
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Katalog", path: "/products", icon: Grid },
    { name: "FAQ", path: "/#faq", icon: HelpCircle },
  ];
  if (pathname === "/dashboard" || pathname === "/admin-panel/dashboard") {
    return null;
  }

  // Hide global header on product detail page
  if (pathname.startsWith('/product/')) return null;

  return (
    <>
      <motion.header
        onClick={() => window.dispatchEvent(new Event('navbar_interaction'))}
        className="fixed top-0 left-0 right-0 w-full z-40 pt-2 pb-0 sm:py-4 px-4 will-change-transform"
      >
        <div className="max-w-6xl mx-auto">
          {/* Main Navbar Container (Floating Pill Style) */}
          <div className="bg-[#0A0F1D]/90 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl md:rounded-[2rem] overflow-hidden">
            {/* Admin Bar (if admin) */}
            {isAdmin && (
              <div className="w-full bg-slate-900 border-b border-pink-500/30 text-white flex items-center transition-all duration-300">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left py-1.5 px-4 md:px-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-pink-400 animate-pulse w-3 h-3 sm:w-4 sm:h-4" />
                    <p className="text-[9px] sm:text-xs font-semibold tracking-wide">
                      <span className="hidden sm:inline">Selamat datang, </span>
                      <span className="text-pink-300 font-black">Admin</span>!
                    </p>
                  </div>
                  <Link
                    href="/admin-panel/dashboard"
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-[9px] sm:text-xs font-black py-1 px-3 rounded-lg hover:scale-[1.03] transition-transform"
                  >
                    <ShieldCheck className="w-3 h-3" /> Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* Navbar Content */}
            <div className="px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
              {/* Logo & Brand */}
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0"
              >
                <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Simoengil Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-lg font-bold text-white tracking-wide group-hover:text-[#FFB6C8] transition-colors font-heading block leading-none truncate">
                    Simoengil
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1.5 border border-white/5">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.path || (link.path === "/#faq" && false); // Basic active logic
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={link.name === "FAQ" ? handleFaqClick : undefined}
                      className={`relative px-4 py-2 text-sm font-bold transition-colors rounded-full flex items-center gap-1.5 ${
                        isActive
                          ? "text-white bg-white/10"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Desktop Right Actions */}
              <div className="hidden md:flex items-center gap-3">
                <a
                  href="https://wa.me/6281545585448?text=Halo%20Simoengil,%20saya%20tertarik%20dengan%20boneka%20handmade%20Simoengil!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4.5 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 items-center gap-2 flex"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="w-4 h-4"
                  >
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                  <span>WhatsApp</span>
                </a>

                {/* Cart */}
                <button
                  data-cart-icon
                  aria-label="Buka keranjang"
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-[#FF8FB1] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#0A0F1D]">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* User */}
                {user ? (
                  <Link
                    href="/dashboard"
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all"
                  >
                    <User className="w-4.5 h-4.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <User className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              {/* Mobile Actions (Right) */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative p-2 rounded-lg bg-white/10 border border-white/10 text-white cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-[#FF8FB1] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0F1D]">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg bg-white/10 border border-white/10 text-white cursor-pointer"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="absolute top-[85px] left-4 right-4 max-w-6xl mx-auto pointer-events-auto md:hidden will-change-transform"
            >
              <div className="bg-[#0A0F1D]/95 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-4 flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path || (link.path === "/#faq" && false);
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={
                        link.name === "FAQ"
                          ? handleFaqClick
                          : () => setIsMobileMenuOpen(false)
                      }
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                        isActive
                          ? "bg-[#FF8FB1]/20 text-[#FFB6C8] border border-[#FF8FB1]/30 shadow-[0_0_15px_rgba(255,143,177,0.1)]"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <link.icon className={`w-5 h-5 ${isActive ? "text-[#FFB6C8]" : ""}`} />
                      {link.name}
                    </Link>
                  );
                })}

                <div className="h-px bg-white/10 my-2" />

                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Akun Saya
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <User className="w-5 h-5" />
                    Masuk / Daftar
                  </button>
                )}

                <a
                  href="https://wa.me/6281545585448?text=Halo%20Simoengil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="w-6 h-6"
                  >
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                  Hubungi WhatsApp
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* DRAWERS & MODALS */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={(p: any) => {
          setIsWishlistOpen(false);
          window.location.href = `/product/${p.id}`; // Simple redirect
        }}
        isLoggedIn={!!user}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
