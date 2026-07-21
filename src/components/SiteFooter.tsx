'use client';

import Link from 'next/link';

// IG Icon
const InstagramIcon = () => (
  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

// WA Icon
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="w-4.5 h-4.5">
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

// Shopee Icon
const ShopeeIcon = () => (
  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
  </svg>
);

export function SiteFooter() {
  const WA_NUMBER = '6281200000000'; // Ganti dengan nomor WhatsApp nyata
  const WA_DISPLAY = '+62 812-0000-0000'; // Ganti dengan nomor display
  const EMAIL = 'simoengil@gmail.com'; // Ganti dengan email nyata
  const CITY = 'Kab. Bandung, Jawa Barat'; // Ganti dengan lokasi nyata
  const INSTAGRAM_URL = 'https://instagram.com/simoengil';
  const SHOPEE_URL = 'https://shopee.co.id/simoengil';

  return (
    <footer
      className="relative text-white border-t-[6px] border-[#FF8FB1]"
      style={{
        backgroundImage: "url('/images/footer.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ── Wave Divider ── */}
      <div className="absolute -top-[1px] left-0 right-0 w-full overflow-hidden leading-none rotate-180 z-20">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 sm:h-20"
        >
          {/* Layer 1 – deepest, lighter pink */}
          <path
            d="M0,32 C180,70 360,0 540,40 C720,80 900,10 1080,50 C1260,88 1380,20 1440,40 L1440,80 L0,80 Z"
            fill="#FFB6C8"
            opacity="0.35"
          />
          {/* Layer 2 – mid, brand pink */}
          <path
            d="M0,50 C200,20 400,75 600,45 C800,15 1000,65 1200,35 C1320,18 1400,55 1440,48 L1440,80 L0,80 Z"
            fill="#FF8FB1"
            opacity="0.5"
          />
          {/* Layer 3 – top, solid fill matches page bg so it "cuts in" */}
          <path
            d="M0,64 C240,40 480,80 720,60 C960,40 1200,74 1440,58 L1440,80 L0,80 Z"
            fill="#FF8FB1"
            opacity="0.25"
          />
          {/* Tiny sparkle dots */}
          <circle cx="200" cy="28" r="2.5" fill="#FFB6C8" opacity="0.7" />
          <circle cx="480" cy="18" r="2" fill="#FF8FB1" opacity="0.6" />
          <circle cx="760" cy="42" r="3" fill="#FFB6C8" opacity="0.5" />
          <circle cx="1050" cy="22" r="2" fill="#FF8FB1" opacity="0.65" />
          <circle cx="1300" cy="36" r="2.5" fill="#FFB6C8" opacity="0.6" />
        </svg>
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 pt-20 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* ── Kolom 1: Brand & Kontak ── */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-[#FFB6C8] bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                <img src="/images/logoNEW.webp" alt="Simoengil Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="block text-2xl font-normal text-white tracking-wide font-magilio leading-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  Simoengil
                </span>
                <span className="block text-[9px] text-[#FFB6C8] font-extrabold uppercase tracking-widest">
                  Premium Handmade Plushie
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/85 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              Toko boneka & plushie premium buatan lokal, berkualitas ekspor. Aman untuk bayi, lembut, dan bisa dicuci.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2.5 text-sm text-white/80 hover:text-[#FFB6C8] transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-xs">{EMAIL}</span>
              </a>

              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-white/80 hover:text-[#25D366] transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#25D366]/20 flex items-center justify-center shrink-0 transition-colors">
                  <WhatsAppIcon />
                </span>
                <span className="text-xs">{WA_DISPLAY}</span>
              </a>

              <div className="flex items-center gap-2.5 text-white/70">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span className="text-xs">{CITY}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-[#FF8FB1] transition-all text-white hover:scale-110 active:scale-95"
                aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-[#25D366] transition-all text-white hover:scale-110 active:scale-95"
                aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href={SHOPEE_URL} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-[#ee4d2d] transition-all text-white hover:scale-110 active:scale-95"
                aria-label="Shopee">
                <ShopeeIcon />
              </a>
            </div>
          </div>

          {/* ── Kolom 2: Navigasi ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#FFB6C8]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Navigasi
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Katalog Produk', href: '/products' },
                { label: 'FAQ / Cara Pesan', href: '/#faq' },
                { label: 'Kebijakan Retur & Garansi', href: '/#faq' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FF8FB1] group-hover:w-2 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Kolom 3: Cara Pesan ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#FFB6C8]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Cara Pesan
            </h4>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Pilih boneka di katalog' },
                { step: '2', text: 'Chat WA atau pesan lewat Shopee' },
                { step: '3', text: 'Transfer & boneka dikirim hari itu!' },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FF8FB1]/80 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <span className="text-sm text-white/80" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{item.text}</span>
                </li>
              ))}
            </ol>

            {/* Payment Methods */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Metode Pembayaran</p>
              <div className="flex flex-wrap gap-1.5">
                {['BCA', 'Mandiri', 'BRI', 'GoPay', 'OVO', 'Shopee Pay'].map((method) => (
                  <span key={method} className="px-2 py-1 rounded-md bg-white/15 text-white/90 text-[10px] font-bold border border-white/10">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Kolom 4: Trust Signals ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#FFB6C8]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Jaminan Kualitas
            </h4>

            <div className="space-y-3">
              {[
                { icon: '🧸', title: '100% Dacron Silikon Murni', desc: 'Tanpa campuran limbah garmen' },
                { icon: '👶', title: 'Hypoallergenic', desc: 'Aman untuk bayi & balita' },
                { icon: '🛡️', title: 'Garansi Cacat Produksi', desc: 'Penggantian dalam 7 hari' },
                { icon: '✅', title: 'Buatan Lokal', desc: 'Berkualitas ekspor, harga terjangkau' },
              ].map((badge) => (
                <div key={badge.title} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{badge.title}</p>
                    <p className="text-xs text-white/65">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1 bg-white/10 rounded-xl px-3 py-2 border border-white/10">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold text-white">5.0</span>
              <span className="text-xs text-white/60">· 200+ Pembeli Puas</span>
            </div>
          </div>
        </div>

        {/* ── Copyright Bar ── */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <p className="text-xs text-white/70" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            © 2026 Boneka Simoengil · Dibuat dengan bahan lokal berkualitas ekspor · All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Bandung, Indonesia 🇮🇩
          </p>
        </div>
      </div>
    </footer>
  );
}
