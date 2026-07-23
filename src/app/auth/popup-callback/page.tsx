'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PopupCallback() {
  const [status, setStatus] = useState('Memproses login...');

  useEffect(() => {
    // Beri sedikit jeda untuk memastikan cookie sudah set dari route handler
    const timer = setTimeout(() => {
      if (window.opener && !window.opener.closed) {
        setStatus('Login berhasil! Menutup jendela...');
        try {
          window.opener.postMessage('AUTH_SUCCESS', window.location.origin);
          setTimeout(() => {
            window.close();
          }, 300);
        } catch (e) {
          console.error("Gagal mengirim pesan ke parent window:", e);
          setStatus('Selesai. Anda bisa menutup jendela ini.');
        }
      } else {
        setStatus('Selesai. Anda bisa menutup jendela ini.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#FFF8F5] text-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Autentikasi</h2>
        <p className="text-slate-500 font-medium">{status}</p>
      </div>
    </div>
  );
}
