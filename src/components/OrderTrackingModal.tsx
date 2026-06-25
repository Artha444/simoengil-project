import React, { useState, useEffect } from 'react';
import { X, Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { lockBodyScroll } from '@/lib/scrollLock';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderTrackingModal({ isOpen, onClose }: OrderTrackingModalProps) {
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    lockBodyScroll(isOpen, 'tracking');
    return () => lockBodyScroll(false, 'tracking');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setOrderData(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.trim())
        .single();

      if (error || !data) {
        throw new Error('Pesanan tidak ditemukan');
      }

      setOrderData(data);
    } catch (e: any) {
      setErrorMsg('Pesanan tidak ditemukan. Pastikan ID Pesanan sudah benar.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-6 h-6 text-orange-500" />;
      case 'SHIPPED': return <Truck className="w-6 h-6 text-blue-500" />;
      case 'DELIVERED': return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      default: return <Package className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Diproses';
      case 'SHIPPED': return 'Sedang Dikirim';
      case 'DELIVERED': return 'Sudah Sampai';
      case 'CANCELED': return 'Dibatalkan';
      default: return status;
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

  const shipping = orderData ? parseJSON(orderData.shipping_address) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-500" />
            Lacak Pesanan
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="text-xs font-bold text-slate-500 block mb-2">Masukkan ID Pesanan Anda</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Contoh: cb14e626-253d-..."
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-200 transition-all"
              />
              <button 
                type="submit" 
                disabled={isLoading || !orderId.trim()}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white px-4 rounded-xl font-bold transition-colors flex items-center justify-center cursor-pointer"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
            {errorMsg && <p className="text-rose-500 text-[10px] mt-2 font-medium">{errorMsg}</p>}
          </form>

          {orderData && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  {getStatusIcon(orderData.status || 'PENDING')}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Status Pesanan</p>
                  <p className="text-sm font-black text-slate-800">{getStatusText(orderData.status || 'PENDING')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">ID Pesanan:</span>
                  <span className="font-bold text-slate-800 truncate w-32 text-right" title={orderData.id}>{orderData.id.split('-')[0].toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Penerima:</span>
                  <span className="font-bold text-slate-800">{shipping?.name || orderData.customer_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">No. Telepon:</span>
                  <span className="font-bold text-slate-800">{shipping?.phone || orderData.customer_phone || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nomor Resi:</span>
                  {orderData.tracking_number ? (
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{orderData.tracking_number}</span>
                  ) : (
                    <span className="text-slate-400 italic">Belum tersedia</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
