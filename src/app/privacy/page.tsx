import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="relative z-10 min-h-screen pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-xl p-8 sm:p-12 border border-pink-100/60">
        
        <div className="mb-10 border-b border-pink-100 pb-8 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-pink-200 bg-white flex items-center justify-center overflow-hidden shrink-0 mx-auto mb-4 shadow-sm">
            <img src="/images/logoNEW.webp" alt="Simoengil Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading mb-3">Kebijakan Privasi</h1>
          <p className="text-slate-500 font-medium text-sm">Terakhir diperbarui: 23 Juli 2026</p>
        </div>

        {/* Daftar Isi Cepat */}
        <div className="bg-pink-50/80 rounded-2xl p-5 mb-10 border border-pink-100/80">
          <p className="text-sm font-bold text-pink-600 mb-3 uppercase tracking-wider">Lompat ke bagian:</p>
          <div className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
            <a href="#data-dikumpulkan" className="hover:text-pink-500 hover:underline transition-colors">1. Data yang Dikumpulkan</a>
            <span className="text-pink-200">|</span>
            <a href="#cara-pengumpulan" className="hover:text-pink-500 hover:underline transition-colors">2. Cara Pengumpulan</a>
            <span className="text-pink-200">|</span>
            <a href="#tujuan" className="hover:text-pink-500 hover:underline transition-colors">3. Tujuan</a>
            <span className="text-pink-200">|</span>
            <a href="#berbagi-data" className="hover:text-pink-500 hover:underline transition-colors">4. Berbagi Data</a>
            <span className="text-pink-200">|</span>
            <a href="#keamanan" className="hover:text-pink-500 hover:underline transition-colors">5. Keamanan Data</a>
            <span className="text-pink-200">|</span>
            <a href="#hak-pengguna" className="hover:text-pink-500 hover:underline transition-colors">6. Hak Pengguna</a>
            <span className="text-pink-200">|</span>
            <a href="#cookie" className="hover:text-pink-500 hover:underline transition-colors">7. Penggunaan Cookie</a>
            <span className="text-pink-200">|</span>
            <a href="#kontak" className="hover:text-pink-500 hover:underline transition-colors">8. Kontak</a>
          </div>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-600 font-medium">
          <section id="data-dikumpulkan" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Data Apa yang Kami Kumpulkan</h2>
            <p>Untuk memberikan pengalaman berbelanja yang terbaik, Simoengil mengumpulkan informasi berikut saat Anda menggunakan layanan kami:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nama lengkap</li>
              <li>Alamat email</li>
              <li>Nomor telepon (WhatsApp)</li>
              <li>Alamat pengiriman lengkap</li>
              <li>Riwayat pesanan dan transaksi</li>
            </ul>
          </section>

          <section id="cara-pengumpulan" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. Cara Data Dikumpulkan</h2>
            <p>Kami mengumpulkan data Anda melalui beberapa cara:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Pendaftaran Langsung:</strong> Melalui form pendaftaran akun dan proses checkout di website.</li>
              <li><strong>Login Sosial (OAuth):</strong> Jika Anda mendaftar menggunakan Google atau Facebook, kami hanya mengambil informasi profil dasar (Nama dan Alamat Email) yang diizinkan oleh platform tersebut.</li>
            </ul>
          </section>

          <section id="tujuan" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. Tujuan Pengumpulan Data</h2>
            <p>Informasi yang kami kumpulkan digunakan untuk tujuan berikut:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Memproses pesanan dan mengelola pengiriman boneka.</li>
              <li>Mengirimkan notifikasi pesanan dan Link Login (OTP) ke email Anda.</li>
              <li>Memberikan dukungan pelanggan dan menyelesaikan kendala pesanan.</li>
            </ul>
          </section>

          <section id="berbagi-data" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Dengan Siapa Data Dibagikan</h2>
            <p>Simoengil tidak akan pernah menjual data Anda. Kami hanya membagikan data Anda kepada pihak ketiga yang berwenang demi kelancaran pesanan Anda, yaitu:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Jasa Ekspedisi:</strong> Nama, nomor telepon, dan alamat akan diberikan kepada kurir (seperti JNE, J&T, SiCepat) untuk keperluan pengiriman paket.</li>
              <li><strong>Payment Gateway:</strong> Detail transaksi (tanpa menyimpan nomor kartu kredit/debit secara langsung) dikelola secara aman oleh payment gateway kami.</li>
              <li><strong>Infrastruktur (Supabase):</strong> Data akun disimpan dengan aman di server basis data Supabase yang merupakan penyedia infrastruktur backend kami.</li>
            </ul>
          </section>

          <section id="keamanan" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">5. Cara Data Disimpan & Diamankan</h2>
            <p>Data pribadi Anda disimpan di *database* dengan tingkat enkripsi industri yang tinggi. Akses terhadap basis data pelanggan dibatasi ketat dan hanya dapat diakses oleh admin inti Simoengil yang berkepentingan langsung dengan pengelolaan pesanan.</p>
          </section>

          <section id="hak-pengguna" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">6. Hak Pengguna (Sesuai UU PDP)</h2>
            <p>Sesuai dengan Undang-Undang Pelindungan Data Pribadi (UU PDP) di Indonesia, Anda memiliki hak penuh atas data Anda:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Hak Akses:</strong> Anda berhak melihat, mengakses, dan memperbarui informasi pribadi Anda melalui profil akun.</li>
              <li><strong>Hak Penghapusan (Right to be Forgotten):</strong> Anda berhak meminta kami untuk menghapus seluruh data akun dan riwayat Anda secara permanen dari sistem kami.</li>
            </ul>
          </section>

          <section id="cookie" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">7. Penggunaan Cookie</h2>
            <p>Kami menggunakan *cookie* esensial di browser Anda semata-mata untuk menjaga agar Anda tetap *login* (menyimpan sesi autentikasi) dan mengingat isi keranjang belanja Anda. Kami tidak menggunakan *cookie* pihak ketiga untuk melacak perilaku *browsing* Anda di luar website Simoengil.</p>
          </section>

          <section id="kontak" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">8. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan terkait Kebijakan Privasi ini atau ingin menggunakan hak penghapusan data Anda, silakan hubungi kami melalui:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>WhatsApp:</strong> 0812-XXXX-XXXX (Ganti dengan nomor asli)</li>
              <li><strong>Email:</strong> admin@simoengil.com</li>
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
}
