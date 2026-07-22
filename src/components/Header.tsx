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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash);
    const onHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  // Detect scroll to toggle header transparency and ScrollSpy for active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // ScrollSpy logic
      if (pathname === "/") {
        const faqSection = document.getElementById("faq");
        if (faqSection) {
          const rect = faqSection.getBoundingClientRect();
          // Jika bagian atas FAQ sudah mencapai pertengahan layar (atau lebih tinggi)
          // dan bagian bawahnya masih terlihat, maka FAQ dianggap aktif
          if (
            rect.top <= window.innerHeight * 0.55 &&
            rect.bottom >= window.innerHeight * 0.2
          ) {
            setActiveHash((prev) => (prev !== "#faq" ? "#faq" : prev));
          } else {
            setActiveHash((prev) => (prev === "#faq" ? "" : prev));
          }
        }
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

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
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === "simoengil_cart") {
        window.dispatchEvent(new Event("cart_updated"));
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
    window.addEventListener("chat_opened", handleChatOpened);
    return () => window.removeEventListener("chat_opened", handleChatOpened);
  }, []);

  const handleFaqClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "#faq");
      setActiveHash("#faq");
    }
    setIsMobileMenuOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
      setActiveHash("");
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
  if (pathname.startsWith("/product/")) return null;

  return (
    <>
      <motion.header
        onClick={() => window.dispatchEvent(new Event("navbar_interaction"))}
        className={`fixed top-0 left-0 right-0 w-full z-40 transition-all duration-700 ease-in-out will-change-transform ${
          isScrolled ? "pt-2 pb-0 sm:py-4 px-4" : "pt-4 px-6 lg:px-12"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-700 ease-in-out ${isScrolled ? "max-w-6xl" : "max-w-full"}`}
        >
          {/* Main Navbar Container (Floating Pill Style) */}
          <div
            className={`transition-all duration-700 ease-in-out border rounded-2xl md:rounded-[2rem] ${
              isScrolled
                ? "bg-[#0A0F1D]/90 backdrop-blur-md border-white/10 shadow-xl"
                : "bg-transparent backdrop-blur-none border-transparent shadow-none"
            }`}
          >
            {/* Admin Bar (if admin) */}
            {isAdmin && (
              <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-pink-500/20 text-white flex items-center justify-center transition-all duration-300 rounded-t-2xl md:rounded-t-[2rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>
                <div className="w-full flex items-center justify-between gap-3 py-2 px-5 md:px-8 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-pink-500/20 rounded-full shrink-0">
                      <Sparkles className="text-pink-400 animate-pulse w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-300">
                      <span className="hidden sm:inline">Masuk sebagai </span>
                      <span className="text-pink-300 font-black tracking-widest uppercase">Admin</span>
                    </p>
                  </div>
                  <Link
                    href="/admin-panel/dashboard"
                    className="inline-flex items-center gap-1.5 bg-pink-500 hover:bg-pink-400 text-white text-[10px] sm:text-[11px] font-bold py-1.5 px-3.5 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_10px_rgba(236,72,153,0.3)] shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    <span>Buka Panel</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Navbar Content */}
            <div
              className={`transition-all duration-700 ease-in-out flex items-center justify-between gap-4 relative ${
                isScrolled
                  ? "px-4 sm:px-6 lg:px-8 h-16 sm:h-20"
                  : "px-0 h-20 sm:h-24"
              }`}
            >
              {/* Logo & Brand */}
              <Link
                href="/"
                onClick={handleHomeClick}
                className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0"
              >
                <div
                  className={`rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center overflow-hidden shrink-0 transition-all duration-700 ease-in-out ${
                    isScrolled
                      ? "w-12 h-12 sm:w-15 sm:h-15"
                      : "w-16 h-16 sm:w-20 sm:h-20"
                  }`}
                >
                  <img
                    src="/images/logoNEW.webp"
                    alt="Simoengil Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-normal tracking-wide group-hover:text-[#FFB6C8] transition-colors font-magilio block leading-none truncate transition-all duration-700 ease-in-out ${
                      isScrolled
                        ? "text-lg sm:text-xl text-white"
                        : "text-xl sm:text-2xl text-[#4A3B32] drop-shadow-md"
                    }`}
                  >
                    Simoengil
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav
                className={`hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 border transition-all duration-700 ease-in-out absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 ${
                  isScrolled
                    ? "bg-white/5 border-white/5"
                    : "bg-white/70 backdrop-blur-md border-white/40 shadow-sm"
                }`}
              >
                {navLinks.map((link) => {
                  let isActive = false;
                  if (link.path.includes("#")) {
                    const [basePath, hashPart] = link.path.split("#");
                    isActive =
                      pathname === basePath && activeHash === `#${hashPart}`;
                  } else {
                    if (link.path === "/") {
                      isActive = pathname === "/" && activeHash === "";
                    } else {
                      isActive = pathname === link.path;
                    }
                  }

                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={
                        link.name === "FAQ"
                          ? handleFaqClick
                          : link.name === "Beranda"
                            ? handleHomeClick
                            : undefined
                      }
                      className={`relative px-4 py-2 text-sm font-bold transition-colors rounded-full flex items-center gap-1.5 ${
                        isActive
                          ? isScrolled
                            ? "text-white bg-white/10"
                            : "text-[#4A3B32] bg-[#4A3B32]/10"
                          : isScrolled
                            ? "text-white/70 hover:text-white hover:bg-white/5"
                            : "text-[#4A3B32]/75 hover:text-[#4A3B32] hover:bg-[#4A3B32]/5"
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
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isScrolled
                      ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                      : "bg-white/70 backdrop-blur-md border-white/40 text-[#4A3B32] shadow-sm hover:bg-white/90"
                  }`}
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
                    href="/account/settings/profile"
                    className={`p-2.5 rounded-xl border transition-all ${
                      isScrolled
                        ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                        : "bg-white/70 backdrop-blur-md border-white/40 text-[#4A3B32] shadow-sm hover:bg-white/90"
                    }`}
                  >
                    <User className="w-4.5 h-4.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isScrolled
                        ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                        : "bg-white/70 backdrop-blur-md border-white/40 text-[#4A3B32] shadow-sm hover:bg-white/90"
                    }`}
                  >
                    <User className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              {/* Mobile Actions (Right) */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className={`relative p-2 rounded-lg border cursor-pointer transition-all ${
                    isScrolled
                      ? "bg-white/10 border-white/10 text-white"
                      : "bg-white/70 backdrop-blur-md border-white/40 text-[#4A3B32] shadow-sm"
                  }`}
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
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    isScrolled
                      ? "bg-white/10 border-white/10 text-white"
                      : "bg-white/70 backdrop-blur-md border-white/40 text-[#4A3B32] shadow-sm"
                  }`}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Dropdown Menu — inside navbar container for proper flow */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                  className="md:hidden will-change-transform px-4 pb-4"
                >
                  <div className="bg-[#0A0F1D]/95 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-4 flex flex-col gap-2">
                    {navLinks.map((link) => {
                      const isActive =
                        pathname === link.path ||
                        (link.path === "/#faq" && false);
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
                          <link.icon
                            className={`w-5 h-5 ${isActive ? "text-[#FFB6C8]" : ""}`}
                          />
                          {link.name}
                        </Link>
                      );
                    })}

                    <div className="h-px bg-white/10 my-2" />

                    {user ? (
                      <Link
                        href="/account/settings/profile"
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
          </div>
        </div>
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
