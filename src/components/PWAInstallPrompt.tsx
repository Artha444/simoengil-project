'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Mengecek apakah app sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Listener untuk event beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      // Tampilkan popup setelah beberapa detik agar tidak terlalu mengganggu
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-[#FFB6C8] rounded-2xl shadow-xl z-50 p-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <button 
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
          <img src="/images/logoNEW.webp" alt="Logo" className="w-8 h-8 object-cover rounded-md" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-sm">Install App Simoengil</h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">Tambahkan ke layar utama untuk akses lebih cepat dan mudah!</p>
          
          <button 
            onClick={handleInstallClick}
            className="w-full bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Install Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}