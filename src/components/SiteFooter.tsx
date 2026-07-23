'use client';

import Link from 'next/link';

// IG Icon
const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

// WA Icon
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4">
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

// Shopee Icon
const ShopeeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
  </svg>
);

export function SiteFooter() {
  const WA_NUMBER = '6281200000000';
  const WA_DISPLAY = '+62 812-0000-0000';
  const EMAIL = 'simoengil@gmail.com';
  const CITY = 'Kab. Bandung, Jawa Barat';
  const INSTAGRAM_URL = 'https://instagram.com/simoengil';
  const SHOPEE_URL = 'https://shopee.co.id/simoengil';

  return (
    <footer 
      className="relative text-white overflow-hidden"
      style={{
        backgroundImage: "url('/images/footer.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'bottom center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* WHITE CLOUD OVERLAY (Sits ON TOP at z-30, pure white clouds extending down from section above) */}
      <div className="absolute top-0 left-0 right-0 w-full z-30 pointer-events-none select-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 140"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block h-auto"
        >
          {/* Main Pure White Cloud Layer connecting seamlessly from top section */}
          <path
            d="
              M0,0 L0,95
              Q60,55 120,80
              Q150,92 180,75
              Q220,52 270,72
              Q300,85 330,68
              Q375,42 420,65
              Q455,82 490,62
              Q535,38 580,60
              Q615,76 650,58
              Q690,38 730,55
              Q770,72 810,52
              Q850,32 895,52
              Q930,68 965,50
              Q1005,30 1050,52
              Q1085,68 1120,50
              Q1165,28 1210,50
              Q1250,68 1290,52
              Q1340,30 1380,55
              Q1415,72 1440,60
              L1440,0 Z
            "
            fill="#ffffff"
          />
          {/* Subtle Secondary Soft Cloud Puff Accent */}
          <path
            d="
              M0,0 L0,110
              Q40,90 80,105
              Q110,115 145,100
              Q180,85 215,100
              Q250,115 285,102
              Q320,88 360,104
              Q395,118 435,103
              Q475,87 515,102
              Q555,118 595,105
              Q635,90 675,106
              Q715,120 755,107
              Q795,92 835,108
              Q875,122 915,108
              Q955,93 995,109
              Q1035,123 1075,110
              Q1115,95 1155,110
              Q1195,124 1240,112
              Q1285,98 1330,112
              Q1380,124 1440,115
              L1440,0 Z
            "
            fill="#ffffff"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75 pointer-events-none z-10" />

      {/* Container Utama (Shifted down significantly to reveal background image) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-[200px] sm:pt-[300px] md:pt-[350px] lg:pt-[450px] pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-white/15">

          {/* ── Kolom 1: Brand Info (Spans 2 columns on desktop) ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-pink-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                <img src="/images/logoNEW.webp" alt="Simoengil Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="block text-2xl font-black text-white tracking-tight font-heading" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                  Simœngil
                </span>
                <span className="block text-[10px] text-pink-300 font-extrabold uppercase tracking-widest">
                  Premium Handmade Plushie
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              Toko boneka & plushie buatan tangan berbahan dacron premium grade A. Aman untuk balita, hypoallergenic, lembut, dan bisa dicuci.
            </p>

            {/* Contacts & Socials */}
            <div className="space-y-2 pt-1 text-xs text-slate-200" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-pink-300 transition-colors">
                <span className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0 text-pink-300">✉</span>
                {EMAIL}
              </a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <span className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0 text-emerald-400">💬</span>
                {WA_DISPLAY}
              </a>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0 text-pink-300">📍</span>
                {CITY}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/15 hover:bg-pink-500 transition-all text-white hover:scale-105" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/15 hover:bg-emerald-500 transition-all text-white hover:scale-105" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href={SHOPEE_URL} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/15 hover:bg-orange-500 transition-all text-white hover:scale-105" aria-label="Shopee">
                <ShopeeIcon />
              </a>
            </div>
          </div>

          {/* ── Kolom 2: Tentang Simoengil ── */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-300" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              Tentang Simoengil
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-200">
              <li>
                <Link href="/#about" className="hover:text-white hover:translate-x-1 transition-all inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white hover:translate-x-1 transition-all inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-white hover:translate-x-1 transition-all inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Kontak Kustomisasi
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Kolom 3: Bantuan ── */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-300" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              Bantuan
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-200">
              <li>
                <Link href="/#faq" className="hover:text-white hover:translate-x-1 transition-all inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  FAQ & Pertanyaan
                </Link>
              </li>
              <li>
                <Link href="/#cara-pesan" className="hover:text-white hover:translate-x-1 transition-all inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Cara Pesan
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>Pembayaran</p>
              <div className="flex flex-wrap gap-1">
                {['BCA', 'Mandiri', 'BRI', 'GoPay', 'ShopeePay'].map((m) => (
                  <span key={m} className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-bold text-white border border-white/10 shadow-sm">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Kolom 4: Legal ── */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-300" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              Legal
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-200">
              <li>
                <Link href="/privacy" className="hover:text-white hover:translate-x-1 transition-all inline-block text-pink-200 font-bold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:translate-x-1 transition-all inline-block text-pink-200 font-bold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Syarat Layanan
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>Jaminan Kualitas</p>
              <div className="space-y-1 text-[11px] text-slate-200 font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                <p className="flex items-center gap-1">✨ 100% Dacron Premium</p>
                <p className="flex items-center gap-1">👶 Safe & Hypoallergenic</p>
                <p className="flex items-center gap-1">🛡️ Garansi Retur 7 Hari</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Copyright Line ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-xs text-slate-300 font-medium">
          <p style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>© 2026 Boneka Simoengil. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="text-[11px] text-slate-400" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>Dibuat dengan ❤️ di Bandung, Indonesia 🇮🇩</p>
        </div>
      </div>
    </footer>
  );
}
