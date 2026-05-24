'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  MapPin, 
  Clock,
  AlertCircle
} from 'lucide-react';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setTrackingData(null);

    try {
      const res = await fetch(`/api/tracking?order_id=${encodeURIComponent(orderId)}`);
      const json = await res.json();

      if (json.status === 'success') {
        setTrackingData(json.data);
      } else {
        setErrorMsg(json.message || 'Gagal melacak resi.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan pada sistem pencarian resi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'PROCESSING': return <Package className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] font-sans selection:bg-[#FF8FB1]/30 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0F1D] text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-sm font-bold font-heading">Lacak Pesanan Simoengil</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* Search Box */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-pink-100/50 mb-8">
          <h2 className="text-xl font-black text-[#2C2C2C] font-heading mb-2">Cari Resi / Order ID</h2>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            Masukkan Order ID Anda (contoh: 550e8400-e29b-41d4-a716-446655440000) untuk mengetahui di mana letak paket teman peluk Anda.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ketik Order ID..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FFB6C8] focus:border-[#FFB6C8] font-medium text-sm transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-4 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Mencari...' : 'Lacak Paket'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Tracking Result */}
        {trackingData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Status Summary Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-pink-100/50">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Paket</p>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(trackingData.trackingStatus)}
                    <h3 className="text-xl font-black text-[#2C2C2C] font-heading">{trackingData.trackingNotes}</h3>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${getStatusColor(trackingData.trackingStatus)}`}>
                  {trackingData.trackingStatus}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Informasi Pengiriman</p>
                  <div className="space-y-1 text-sm font-medium text-slate-700">
                    <p>Kurir: <span className="font-bold">{trackingData.courier?.name || '-'} ({trackingData.courier?.service || '-'})</span></p>
                    <p>Resi: <span className="font-bold text-[#FF8FB1]">{trackingData.orderId.split('-')[0].toUpperCase()}</span></p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alamat Tujuan</p>
                  <div className="space-y-1 text-sm font-medium text-slate-700 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-bold block">{trackingData.shippingAddress?.name}</span>
                      <span className="text-slate-500 text-xs mt-0.5 block line-clamp-2">
                        {trackingData.shippingAddress?.detailAddress}, {trackingData.shippingAddress?.city}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dummy Map Visualizer */}
            {trackingData.trackingStatus !== 'PENDING' && (
              <div className="relative w-full h-48 bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20"></div>
                
                <div className="absolute inset-0 flex items-center justify-between px-10">
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-[#FF8FB1] shadow-[0_0_15px_rgba(255,143,177,0.8)] border-2 border-white"></div>
                    <span className="text-[10px] font-bold bg-white/90 px-2 py-1 rounded shadow-sm">Toko Simoengil</span>
                  </div>
                  
                  {/* Dotted Line */}
                  <div className="flex-1 h-0.5 border-t-2 border-dashed border-[#FFB6C8] mx-2 relative top-[-10px]">
                    <div className={`absolute -top-3 w-6 h-6 bg-white rounded-full shadow border-2 border-[#FF8FB1] flex items-center justify-center transition-all duration-1000 ${
                      trackingData.trackingStatus === 'DELIVERED' ? 'left-[100%] -translate-x-full' :
                      trackingData.trackingStatus === 'SHIPPED' ? 'left-[60%]' :
                      'left-[10%]'
                    }`}>
                      <Truck className="w-3.5 h-3.5 text-[#FF8FB1]" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${trackingData.trackingStatus === 'DELIVERED' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></div>
                    <span className="text-[10px] font-bold bg-white/90 px-2 py-1 rounded shadow-sm line-clamp-1 max-w-[80px] text-center">
                      {trackingData.shippingAddress?.city || 'Tujuan'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-pink-100/50">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Riwayat Perjalanan</h3>
              
              <div className="relative pl-6 space-y-6 border-l-2 border-[#FFB6C8]/30">
                {trackingData.history.map((hist: any, idx: number) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white ${isLatest ? 'bg-[#FF8FB1] shadow-[0_0_10px_rgba(255,143,177,0.5)]' : 'bg-slate-300'}`}></div>
                      <div>
                        <p className={`font-bold text-sm ${isLatest ? 'text-[#2C2C2C]' : 'text-slate-500'}`}>
                          {hist.status}
                        </p>
                        <p className={`text-xs mt-1 ${isLatest ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                          {hist.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">
                          {new Date(hist.date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
