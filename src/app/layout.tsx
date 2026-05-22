import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boneka Simoengil | Temukan Teman Peluk Pertamamu!",
  description: "Toko boneka & plushie premium online. Bahan 100% dacron premium grade A, washable, hypoallergenic, cocok untuk anak-anak & kado istimewa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${quicksand.variable} scroll-smooth h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-blue-50/40 text-slate-800 antialiased selection:bg-pink-100 selection:text-pink-600">
        {children}
      </body>
    </html>
  );
}

