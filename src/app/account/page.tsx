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
  ShieldCheck,
  Sparkles,
  Settings,
  Pencil,
  Loader2,
  Camera,
  ChevronRight,
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
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung. Harap unggah gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar');

      const avatarUrl = data.url;

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: avatarUrl
        }
      });
      alert('Foto profil berhasil diperbarui!');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat mengunggah foto.');
    } finally {
      setIsUploading(false);
    }
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

  const getAvatarStyle = (email: string, role?: string) => {
    if (role === 'admin') {
      return 'bg-slate-900';
    }
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
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return `bg-gradient-to-br ${colors[index]}`;
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 1).toUpperCase();
    }
    if (email) {
      return email.substring(0, 1).toUpperCase();
    }
    return 'U';
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
    <div className="w-full space-y-8">
        
        {/* HERO PROFILE SECTION */}
        <div className="flex flex-col items-center pt-6 pb-2 relative">
          
          {/* Top Right Camera Icon for Upload */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
            <label className="cursor-pointer p-2.5 sm:p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-full shadow-sm border border-slate-200 flex items-center justify-center transition-all group">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <div className="relative">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px] font-black border border-white leading-none pb-0.5">+</div>
                </div>
              )}
            </label>
          </div>

          {/* Avatar Container */}
          <label className="relative cursor-pointer group mt-4 sm:mt-6">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 ${!user.user_metadata?.avatar_url && user.user_metadata?.role !== 'admin' ? getAvatarStyle(user.email || '') : 'bg-white'}`}>
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : user.user_metadata?.role === 'admin' ? (
                <img src="/favicon.png" alt="Admin" className="w-full h-full object-cover p-2" />
              ) : (
                <span className="font-black text-white text-5xl sm:text-6xl uppercase tracking-tighter drop-shadow-md">
                  {getInitials(user.user_metadata?.full_name, user.email)}
                </span>
              )}
            </div>
            {/* PRO Badge / Role Badge overlapping avatar */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-pink-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border-2 border-white shadow-sm uppercase tracking-widest whitespace-nowrap">
                {user.user_metadata?.role === 'admin' ? 'Admin' : 'Member'}
              </div>
            </div>
          </label>

          {/* User Info */}
          <div className="text-center mt-7 space-y-1">
             <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading flex items-center justify-center gap-2">
                {user.user_metadata?.full_name || "Pelanggan Setia"}
                {user.user_metadata?.role === 'admin' && <ShieldCheck className="w-5 h-5 text-blue-500" />}
             </h1>
             <p className="text-slate-500 font-medium text-sm sm:text-base">
                {user.email}
             </p>
          </div>
        </div>

        {/* BOTTOM MENU SECTION (White Container) */}
        <div className="bg-white rounded-t-[2.5rem] shadow-[0_-4px_25px_-10px_rgba(0,0,0,0.05)] w-full min-h-[60vh] p-6 sm:p-10 mt-4 sm:mt-8 relative z-10 border-x border-t border-slate-100">
          <div className="max-w-3xl mx-auto space-y-3">
            
            <Link href="/account/settings/profile" className="flex items-center justify-between p-4 sm:p-5 hover:bg-pink-50/50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-pink-100/50">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-slate-800 sm:text-lg">Edit profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors" />
            </Link>

            <div onClick={() => document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="flex items-center justify-between p-4 sm:p-5 hover:bg-indigo-50/50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-indigo-100/50">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-slate-800 sm:text-lg">My orders</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>

            <Link href="/account/settings/security" className="flex items-center justify-between p-4 sm:p-5 hover:bg-orange-50/50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-orange-100/50">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-slate-800 sm:text-lg">Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </Link>

            <Link href="mailto:support@simoengil.com" className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-slate-200/60">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-slate-800 sm:text-lg">Help</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>
            
            <div onClick={() => setIsLogoutModalOpen(true)} className="flex items-center justify-between p-4 sm:p-5 hover:bg-rose-50/50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-rose-100/50">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold text-rose-600 sm:text-lg">Logout</span>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-300 group-hover:text-rose-500 transition-colors" />
            </div>
            
            <div className="w-full h-px bg-slate-100 my-8 sm:my-10"></div>

            {/* ORDER HISTORY SECTION INSIDE WHITE CARD */}
            <div id="orders-section">

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

            </div>
          </div>
        </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <LogOut className="w-8 h-8 pr-1" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-2">Keluar Akun?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              Apakah Anda yakin ingin keluar? Anda perlu masuk kembali untuk berbelanja dan melihat pesanan Anda.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-rose-500/20"
              >
                Ya, Keluar Akun
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-95"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

