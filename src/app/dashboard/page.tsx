'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  MessageSquare
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'PENDING') // only orders that have been paid/processed
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error('Failed to fetch user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
        fetchUserOrders(session.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handlePayNow = (snapToken: string, orderId: string) => {
    if (snapToken.startsWith('MOCK-TOKEN-')) {
      // Simulation mode
      handleSimulatePayment(orderId);
      return;
    }

    if ((window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: function(result: any) {
          alert('Pembayaran sukses! Status pesanan akan segera diperbarui.');
          if (user) fetchUserOrders(user.id);
        },
        onPending: function(result: any) {
          alert('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.');
          if (user) fetchUserOrders(user.id);
        },
        onError: function(result: any) {
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          alert('Anda menutup halaman pembayaran.');
        }
      });
    } else {
      // Fallback: If snap.js isn't loaded but we have token, we can link to midtrans redirect
      alert('Mengalihkan ke simulasi pembayaran...');
      handleSimulatePayment(orderId);
    }
  };

  const handleSimulatePayment = async (orderId: string) => {
    const confirmPay = window.confirm('Apakah Anda ingin mensimulasikan pembayaran sukses untuk pesanan ini?');
    if (!confirmPay) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'PROCESSING' })
        .eq('id', orderId);

      if (error) throw error;
      alert('Simulasi pembayaran berhasil! Status pesanan diubah menjadi PROCESSING.');
      if (user) fetchUserOrders(user.id);
    } catch (e) {
      alert('Gagal memproses simulasi pembayaran.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Pembayaran
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3.5 h-3.5" />
            Sedang Diproses
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3.5 h-3.5" />
            Sedang Dikirim
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case 'CANCELED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const parseJSON = (val: any) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return val;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-pink-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Toko
        </Link>
        
        {/* User Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Halo, {user.user_metadata?.full_name || 'Pelanggan Setia'}!</h1>
              <p className="text-slate-500 text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-500" />
            Riwayat Pesanan
          </h2>

          {loadingOrders ? (
            <div className="text-center py-12 text-slate-400 font-medium">Memuat riwayat pesanan...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm font-medium">Anda belum melakukan pembelian apa pun.</p>
              <Link href="/" className="mt-4 inline-block text-xs font-bold bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition-colors">
                Belanja Sekarang 🧸
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const shipping = parseJSON(order.shipping_address);
                const itemsList = parseJSON(order.items) || [];
                const courier = parseJSON(order.courier);
                const formattedDate = new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });

                return (
                  <div key={order.id} className="border border-slate-150 rounded-2xl p-6 hover:shadow-md transition-shadow space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">ID PESANAN</span>
                        <span className="text-sm font-black text-slate-800 font-mono">{order.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">TANGGAL PEMBELIAN</span>
                        <span className="text-xs font-bold text-slate-600">{formattedDate}</span>
                      </div>
                      <div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {itemsList.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                            ) : (
                              <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center border border-pink-100">🧸</div>
                            )}
                            <div>
                              <span className="font-bold text-slate-800 block">{item.name}</span>
                              <span className="text-[10px] font-semibold text-slate-400">Variasi: {item.size || 'Default'}</span>
                            </div>
                          </div>
                          <div className="text-right font-medium text-slate-600">
                            {item.quantity} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address & Courier Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 border border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="font-bold text-slate-400 block uppercase tracking-wider mb-1">ALAMAT PENGIRIMAN</span>
                          <span className="font-bold text-slate-700 block">{shipping?.name}</span>
                          <span className="text-slate-500 block">{shipping?.detailAddress}, {shipping?.city}, {shipping?.province} {shipping?.postalCode}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 block uppercase tracking-wider mb-1">PENGIRIMAN & KURIR</span>
                          <span className="font-bold text-slate-700 block">{courier?.name} - {courier?.service}</span>
                          <span className="text-slate-500 block">Biaya Ongkir: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(courier?.cost || 0)}</span>
                          {order.tracking_number && (
                            <div className="mt-2">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">NOMOR RESI</span>
                              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block uppercase tracking-widest">{order.tracking_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action & Total Price */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">TOTAL HARGA</span>
                        <span className="text-lg font-black text-slate-800">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total_price)}
                        </span>
                      </div>
                      <div>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handlePayNow(order.midtrans_token || '', order.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            Bayar Sekarang
                          </button>
                        )}
                        {order.status !== 'PENDING' && (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                            <CheckCircle className="w-4 h-4" />
                            Sudah Dibayar
                          </div>
                        )}
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
  );
}

