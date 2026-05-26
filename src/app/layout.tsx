import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boneka Simoengil | Temukan Teman Peluk Pertamamu!",
  description: "Toko boneka & plushie premium online. Bahan 100% dacron premium grade A, washable, hypoallergenic, cocok untuk anak-anak & kado istimewa.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} ${inter.variable} scroll-smooth h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans text-[#2C2C2C] antialiased selection:bg-pink-100 selection:text-pink-600 relative overflow-x-hidden">
        
        {/* Midtrans Snap JS SDK */}
        <Script
          src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
            ? "https://app.midtrans.com/snap/snap.js" 
            : "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
          strategy="lazyOnload"
        />

        {/* Global Fixed Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Base Soft Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F3] via-[#FFF5F0] to-[#FFE4EC]" />
          
          {/* SVG Repeating Pattern */}
          <div className="absolute inset-0 bg-cute-pattern opacity-80" />

          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #ffb6c8 1px, transparent 1px), linear-gradient(to bottom, #ffb6c8 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }} 
          />
          
          {/* Faint Floating Elements */}
          <div className="absolute top-[15%] left-[10%] text-6xl opacity-30 animate-float-slow">☁️</div>
          <div className="absolute top-[60%] right-[10%] text-5xl opacity-40 animate-float-fast">⭐</div>
          <div className="absolute bottom-[20%] left-[20%] text-4xl opacity-40 animate-float">🧸</div>
          <div className="absolute top-[30%] right-[25%] text-4xl opacity-30 animate-float-slow" style={{ animationDelay: '1s' }}>💖</div>
          
          {/* Subtle Color Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-white/40 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FFB6C8]/10 blur-3xl" />
        </div>
        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}


