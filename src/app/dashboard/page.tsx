"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  User,
  LogOut,
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  CreditCard,
  MessageSquare,
  ShoppingBag,
  MapPin,
  Calendar,
  ShoppingCart,
  Home,
  Grid,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { WishlistDrawer } from "@/components/WishlistDrawer";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
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

  const handleProductDetailClick = (p: any) => {
    setIsWishlistOpen(false);
    router.push(`/product/${p.id}`);
  };

  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error("Failed to fetch user orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setUser(session.user);
        if (session.user?.user_metadata?.role === "admin") {
          setIsAdmin(true);
        }
        fetchUserOrders(session.user.id);
      }
      setLoading(false);
    };
    checkUser();

    // Listen for auth changes
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

    const savedCart = localStorage.getItem("simoengil_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handlePayNow = (snapToken: string, orderId: string) => {
    // If it's a mock token or empty, use simulation
    if (!snapToken || snapToken.startsWith("MOCK-TOKEN-")) {
      handleSimulatePayment(orderId);
      return;
    }

    if ((window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          // Update order status directly from frontend since there's no webhook set up yet
          try {
            await supabase
              .from("orders")
              .update({ status: "PROCESSING" })
              .eq("id", orderId);
            alert("Pembayaran sukses! Status pesanan telah diperbarui.");
          } catch (e) {
            console.error(e);
            alert(
              "Pembayaran sukses, tapi gagal memperbarui status di sistem.",
            );
          }
          if (user) fetchUserOrders(user.id);
        },
        onPending: function (result: any) {
          alert("Pembayaran tertunda. Silakan selesaikan pembayaran Anda.");
          if (user) fetchUserOrders(user.id);
        },
        onError: function (result: any) {
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          if (user) fetchUserOrders(user.id);
        },
      });
    } else {
      // snap.js not loaded, fall back to simulation
      handleSimulatePayment(orderId);
    }
  };

  const handleSimulatePayment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "PROCESSING" })
        .eq("id", orderId);

      if (error) throw error;
      alert("Pesanan Anda sekarang sedang diproses!");
      if (user) fetchUserOrders(user.id);
    } catch (e) {
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Menunggu Pembayaran
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm backdrop-blur-sm">
            <Package className="w-3.5 h-3.5" />
            Sedang Diproses
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-sm backdrop-blur-sm">
            <Truck className="w-3.5 h-3.5" />
            Sedang Dikirim
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm backdrop-blur-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm backdrop-blur-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const parseJSON = (val: any) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return val;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Memuat dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="-mt-24 min-h-screen bg-[#F8FAFC] text-slate-800 antialiased selection:bg-pink-100 selection:text-pink-600 pb-20">
      
      {/* Premium Top Navigation Bar */}
      <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
          <div className="font-black text-lg tracking-tight bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            Simoengil.
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full relative z-10 px-0 sm:px-4 mt-0 sm:mt-6">
        
        {/* HERO PROFILE SECTION */}
        <div className="bg-white sm:rounded-3xl shadow-sm border-x border-b sm:border border-slate-200/60 overflow-hidden relative group">
          {/* Cover Banner */}
          <div className="h-32 sm:h-48 w-full bg-gradient-to-tr from-pink-200 via-rose-100 to-purple-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-cute-pattern opacity-20 mix-blend-overlay"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-2xl rounded-full"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-400/20 blur-2xl rounded-full"></div>
            {/* Logout Button Absolute */}
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 bg-white/40 hover:bg-white/80 backdrop-blur-md text-rose-600 hover:text-rose-700 p-2.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all border border-white/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar Akun</span>
            </button>
          </div>

          {/* User Info Container */}
          <div className="px-6 sm:px-8 pb-8 relative">
            {/* Floating Avatar */}
            <div className="relative -mt-12 sm:-mt-16 mb-4 flex justify-between items-end">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gradient-to-br from-pink-400 to-rose-400 shadow-xl flex items-center justify-center text-white text-3xl sm:text-5xl ring-4 ring-pink-50 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <User className="w-1/2 h-1/2" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  {user.user_metadata?.full_name || "Pelanggan Setia"}
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1 text-sm sm:text-base">
                  {user.email}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200/50 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Simoengil Member
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex gap-3 sm:gap-6 mt-4 sm:mt-0 bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-100">
                <div className="text-center px-3 sm:px-5">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pesanan</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-800">{orders.length}</p>
                </div>
                <div className="w-[1px] bg-slate-200"></div>
                <div className="text-center px-3 sm:px-5">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Poin</p>
                  <p className="text-xl sm:text-2xl font-black text-pink-500">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER HISTORY SECTION */}
        <div className="mt-6 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-pink-500" />
              Pesanan Saya
            </h2>
          </div>

          {loadingOrders ? (
            /* Shimmer Loading Items */
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="h-6 bg-slate-100 rounded-md w-1/3"></div>
                  <div className="h-20 bg-slate-50 rounded-xl w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            /* Empty State Premium */
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-12 flex flex-col items-center justify-center text-center overflow-hidden relative">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-pink-300 to-rose-300"></div>
              <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center text-4xl mb-6 border-8 border-white shadow-lg relative z-10">
                🧸
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Pesanan</h3>
              <p className="text-slate-500 mb-8 max-w-sm text-sm">
                Koleksi boneka handmade Simoengil siap menemani hari-harimu. Yuk, mulai petualangan mencari teman peluk pertamamu!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-bold bg-slate-900 hover:bg-pink-500 text-white px-8 py-3.5 rounded-full shadow-lg shadow-slate-900/20 hover:shadow-pink-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Mulai Belanja <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const shipping = parseJSON(order.shipping_address);
                const itemsList = parseJSON(order.items) || [];
                const courier = parseJSON(order.courier);
                const formattedDate = new Date(
                  order.created_at,
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 overflow-hidden group"
                  >
                    {/* Order Top Strip */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 group-hover:bg-pink-50/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">
                            Tanggal Order
                          </span>
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-pink-400" />
                            {formattedDate}
                          </span>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200"></div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">
                            Status
                          </span>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">
                          ID Pesanan
                        </span>
                        <span className="text-xs font-mono font-bold bg-slate-200/50 text-slate-600 px-2 py-1 rounded-md">
                          #{order.id.split("-")[0].toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Items Grid */}
                      <div className="space-y-4">
                        {itemsList.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]"
                          >
                            <div className="relative">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm"
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center text-2xl">
                                  🧸
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md ring-2 ring-white">
                                x{item.quantity}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 mb-2 font-medium">
                                Variasi: <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{item.size || "Default"}</span>
                              </p>
                              <div className="text-sm font-black text-pink-600">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  maximumFractionDigits: 0,
                                }).format(item.price)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Info Logistics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Alamat */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                          <span className="font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px] mb-2">
                            <MapPin className="w-3.5 h-3.5" /> Tujuan Pengiriman
                          </span>
                          <span className="font-bold text-slate-700 block mb-1 text-sm">
                            {shipping?.name}
                          </span>
                          <span className="text-slate-500 text-xs leading-relaxed block">
                            {shipping?.detailAddress}, {shipping?.city},{" "}
                            {shipping?.province} {shipping?.postalCode}
                          </span>
                        </div>

                        {/* Kurir */}
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                          <span className="font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px] mb-2">
                            <Truck className="w-3.5 h-3.5" /> Pengiriman & Resi
                          </span>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-700 uppercase text-sm">
                              {courier?.name}{" "}
                              <span className="text-slate-400 font-normal">({courier?.service})</span>
                            </span>
                            <span className="font-bold text-slate-600 text-sm">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0,
                              }).format(courier?.cost || 0)}
                            </span>
                          </div>
                          {order.tracking_number ? (
                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Resi:</span>
                              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 text-xs uppercase tracking-wider shadow-sm">
                                {order.tracking_number}
                              </span>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-slate-200/60 text-[10px] font-medium text-slate-400 italic">
                              Resi belum tersedia
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Area: Price & Action */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                            TOTAL PEMBAYARAN
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(order.total_price)}
                          </span>
                        </div>
                        
                        <div className="flex justify-end">
                          {order.status === "PENDING" ? (
                            <button
                              onClick={() =>
                                handlePayNow(
                                  order.midtrans_token || "",
                                  order.id,
                                )
                              }
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-pink-500 text-white font-bold text-sm rounded-full shadow-lg shadow-slate-900/20 hover:shadow-pink-500/30 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                              Bayar Sekarang
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-5 py-3 rounded-full shadow-sm">
                              <CheckCircle className="w-5 h-5" />
                              Pembayaran Selesai
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={handleProductDetailClick}
        isLoggedIn={true}
      />

      {/* Floating WhatsApp Button (Mobile Only) */}
      <a
        href="https://wa.me/6281545585448?text=Halo%20Simoengil,%20saya%20butuh%20bantuan%20mengenai%20pesanan%20saya!"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-6 right-4 z-50 p-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center animate-bounce"
        aria-label="Chat WhatsApp"
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
      </a>
    </div>
  );
}

