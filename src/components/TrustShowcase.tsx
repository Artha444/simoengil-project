"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TRUST_ITEMS = [
  {
    image: "/images/3-Hand.jpeg",
    title: "100% Jahitan Tangan",
    description:
      "Setiap boneka kami dijahit dengan tangan, satu per satu, penuh ketelitian. Nggak ada mesin massal—cuma keterampilan dan kesabaran, supaya tiap jahitan kuat dan nggak gampang lepas.",
  },
  {
    image: "/images/4-Ruler.jpeg",
    title: "Detail Rapih & Kuat",
    description:
      "Ukuran boneka flanel kami memang mungil, tapi detailnya nggak sembarangan. Setiap pola diukur presisi supaya proporsinya pas dan jahitannya tetap kuat meski sering dipeluk.",
  },
  {
    image: "/images/1-Cardboard.jpeg",
    title: "Packing Aman",
    description:
      "Boneka diisi dakron premium yang empuk dan padat, lalu dikemas rapat dengan kardus tebal supaya aman sampai tujuan tanpa penyok, kotor, atau rusak di jalan.",
  },
  {
    image: "/images/2-Truck.jpeg",
    title: "Pengiriman Cepat",
    description:
      "Begitu pesanan selesai dijahit, langsung kami kirim secepat mungkin—supaya boneka baru kamu nggak lama-lama menunggu di perjalanan.",
  },
];

const GAP = 20;

export default function TrustShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const clamped = (index + TRUST_ITEMS.length) % TRUST_ITEMS.length;
    setActiveIndex(clamped);

    const container = scrollRef.current;
    const card = container?.children[clamped] as HTMLElement | undefined;
    if (!container || !card) return;

    // Hitung posisi center yang akurat agar scroll tepat di tengah
    const scrollLeft =
      card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  return (
    <div className="relative z-10 w-full bg-[#FCE6CB] py-20">
      <div className="w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory scroll-smooth overflow-x-auto scrollbar-none"
          style={{
            gap: `${GAP}px`,
            // Agar card pertama dan terakhir benar-benar bisa ke tengah:
            // Lebar card = 90vw, sisa layar = 10vw, dibagi 2 = 5vw di kiri dan kanan
            paddingLeft: "5vw",
            paddingRight: "5vw",
          }}
        >
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="snap-center shrink-0"
              // Diperbesar menjadi 90vw dan max-width 1200px
              style={{ width: "90vw", maxWidth: "1200px" }}
            >
              <div
                className={`
                  bg-[#FFFBF3] rounded-[1rem] sm:rounded-[2rem]
                  grid grid-cols-1 md:grid-cols-2
                  transition-all duration-500 ease-out h-full
                  ${
                    i === activeIndex
                      ? "shadow-lg scale-100 opacity-100"
                      : "shadow-sm scale-[0.96] opacity-60"
                  }
                `}
              >
                {/* Image section with padding and inner rounding */}
                <div className="p-4 sm:p-10 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl overflow-hidden aspect-[4/3] md:min-h-[400px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover block transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Text section */}
                <div className="flex flex-col justify-center p-6 sm:p-12 pl-4 sm:pl-4 gap-6">
                  <h3 className="font-serif text-3xl sm:text-6xl text-[#1A1A1A] leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-lg text-[#4A4A4A] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls aligned with the active card */}
      <div 
        className="mx-auto mt-8 flex justify-between items-center" 
        style={{ width: "90vw", maxWidth: "1200px" }}
      >
        <div className="font-serif text-5xl sm:text-7xl text-[#D48C70]">
          .0{activeIndex + 1}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Sebelumnya"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#D48C70] hover:bg-[#C27D62] text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Berikutnya"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#D48C70] hover:bg-[#C27D62] text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
