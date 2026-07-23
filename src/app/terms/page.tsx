import React from 'react';

export default function TermsOfService() {
  return (
    <div className="relative z-10 min-h-screen pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-xl p-8 sm:p-12 border border-pink-100/60">
        
        <div className="mb-10 border-b border-pink-100 pb-8 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-pink-200 bg-white flex items-center justify-center overflow-hidden shrink-0 mx-auto mb-4 shadow-sm">
            <img src="/images/logoNEW.webp" alt="Simoengil Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading mb-3">Syarat Layanan</h1>
          <p className="text-slate-500 font-medium text-sm">Terakhir diperbarui: 23 Juli 2026</p>
        </div>

        {/* Daftar Isi Cepat */}
        <div className="bg-pink-50/80 rounded-2xl p-5 mb-10 border border-pink-100/80">
          <p className="text-sm font-bold text-pink-600 mb-3 uppercase tracking-wider">Lompat ke bagian:</p>
          <div className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
            <a href="#definisi" className="hover:text-pink-500 hover:underline transition-colors">1. Definisi</a>
            <span className="text-pink-200">|</span>
            <a href="#aturan-akun" className="hover:text-pink-500 hover:underline transition-colors">2. Aturan Akun</a>
            <span className="text-pink-200">|</span>
            <a href="#transaksi" className="hover:text-pink-500 hover:underline transition-colors">3. Transaksi</a>
            <span className="text-pink-200">|</span>
            <a href="#pengiriman" className="hover:text-pink-500 hover:underline transition-colors">4. Pengiriman & Retur</a>
            <span className="text-pink-200">|</span>
            <a href="#haki" className="hover:text-pink-500 hover:underline transition-colors">5. Hak Kekayaan Intelektual</a>
            <span className="text-pink-200">|</span>
            <a href="#tanggung-jawab" className="hover:text-pink-500 hover:underline transition-colors">6. Batasan Tanggung Jawab</a>
            <span className="text-pink-200">|</span>
            <a href="#hukum" className="hover:text-pink-500 hover:underline transition-colors">7. Hukum Berlaku</a>
            <span className="text-pink-200">|</span>
            <a href="#perubahan" className="hover:text-pink-500 hover:underline transition-colors">8. Perubahan Syarat</a>
          </div>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-600 font-medium">
          <section id="definisi" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. Definisi & Ruang Lingkup</h2>
            <p>Selamat datang di Simoengil. Syarat Layanan ini mengatur penggunaan website dan layanan pembelian boneka flanel *handmade* kami. Dengan membuat akun dan/atau melakukan pembelian, Anda menyetujui seluruh ketentuan yang tertulis di sini. Anda harus berusia minimal 13 tahun untuk dapat membuat akun di Simoengil.</p>
          </section>

          <section id="aturan-akun" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. Aturan Akun</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Anda bertanggung jawab menjaga keamanan akun dan perangkat Anda saat masuk ke website Simoengil.</li>
              <li>Dilarang membuat akun palsu, melakukan spam, atau menggunakan identitas orang lain untuk tujuan penipuan.</li>
              <li>Kami berhak memblokir atau menghapus akun secara sepihak apabila ditemukan indikasi penyalahgunaan (*abuse*).</li>
            </ul>
          </section>

          <section id="transaksi" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. Aturan Transaksi</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Seluruh harga yang tertera di website adalah final, belum termasuk ongkos kirim.</li>
              <li>Pemesanan baru akan diproses pembuatannya (karena bersifat *handmade*) setelah pembayaran berhasil dikonfirmasi.</li>
              <li>Pembatalan pesanan tidak dapat dilakukan apabila produk sudah memasuki tahap produksi atau sudah diserahkan ke jasa ekspedisi.</li>
            </ul>
          </section>

          <section id="pengiriman" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Kebijakan Pengiriman & Retur</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Proses Pengerjaan:</strong> Estimasi waktu pengerjaan boneka akan diinformasikan saat pemesanan. Keterlambatan akibat overload akan kami beritahukan sebelumnya.</li>
              <li><strong>Kerusakan Pengiriman:</strong> Apabila paket rusak berat selama perjalanan yang diakibatkan kelalaian pihak ekspedisi, biaya kirim ulang/retur akan didiskusikan dengan melampirkan video *unboxing* tanpa jeda.</li>
              <li><strong>Retur & Refund:</strong> Pengembalian dana atau retur barang hanya berlaku apabila produk yang diterima cacat produksi, bukan karena kerusakan akibat pemakaian atau kelalaian pembeli. Syarat klaim wajib melampirkan video *unboxing*.</li>
            </ul>
          </section>

          <section id="haki" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">5. Hak Kekayaan Intelektual</h2>
            <p>Seluruh materi di website ini, termasuk namun tidak terbatas pada desain boneka, pola, foto produk, logo, dan nama merek "Simoengil" adalah kekayaan intelektual milik kami. Dilarang keras meniru desain, menggunakan foto produk untuk kepentingan komersial pihak ketiga, atau menduplikasi karya kami tanpa izin tertulis.</p>
          </section>

          <section id="tanggung-jawab" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">6. Batasan Tanggung Jawab</h2>
            <p>Simoengil selalu memastikan kualitas produk aman dan sesuai deskripsi. Namun, kami tidak bertanggung jawab atas cedera, kerusakan, atau kerugian yang timbul akibat penyalahgunaan produk (misalnya: diberikan kepada bayi di bawah umur rekomendasi tanpa pengawasan, dimakan, atau dicuci dengan bahan kimia berbahaya).</p>
          </section>

          <section id="hukum" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">7. Hukum yang Berlaku</h2>
            <p>Segala ketentuan dalam Syarat Layanan ini dan semua transaksi yang dilakukan melalui Simoengil tunduk sepenuhnya pada hukum dan peraturan yang berlaku di wilayah Republik Indonesia.</p>
          </section>

          <section id="perubahan" className="scroll-mt-32 sm:scroll-mt-36">
            <h2 className="text-lg font-bold text-slate-800 mb-2">8. Perubahan Syarat Layanan</h2>
            <p>Simoengil berhak untuk memperbarui, mengubah, atau mengganti bagian mana pun dari Syarat Layanan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini. Kami akan berusaha memberitahukan pengguna melalui email apabila terdapat perubahan yang signifikan.</p>
          </section>
        </div>

      </div>
    </div>
  );
}
