"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EditModal, brToNl, nlToBr } from "@/app/Editable";

interface TrustItem {
  image: string;
  title: string;
  description: string;
}

interface TrustShowcaseProps {
  isAdmin?: boolean;
  items?: TrustItem[];
  onSave?: (items: TrustItem[]) => Promise<void>;
}

const DEFAULT_TRUST_ITEMS: TrustItem[] = [
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

type EditingField = { index: number; field: "title" | "description" } | null;

export default function TrustShowcase({
  isAdmin = false,
  items: propItems,
  onSave,
}: TrustShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<TrustItem[]>(
    propItems && propItems.length > 0 ? propItems : DEFAULT_TRUST_ITEMS
  );
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (propItems && propItems.length > 0) setItems(propItems);
  }, [propItems]);

  const goTo = (index: number) => {
    const el = document.getElementById(`trust-scroll`);
    const clamped = (index + items.length) % items.length;
    setActiveIndex(clamped);
    const container = el;
    const card = container?.children[clamped] as HTMLElement | undefined;
    if (!container || !card) return;
    const scrollLeft =
      card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  const handleFieldSave = async (newValue: string) => {
    if (!editingField) return;
    const updated = items.map((item, i) =>
      i === editingField.index
        ? { ...item, [editingField.field]: newValue }
        : item
    );
    setItems(updated);
    if (onSave) await onSave(updated);
  };

  const activeField = editingField
    ? items[editingField.index]?.[editingField.field] ?? ""
    : "";

  const activeLabel = editingField
    ? `Kartu ${editingField.index + 1} — ${editingField.field === "title" ? "Judul" : "Deskripsi"}`
    : "";

  return (
    <div className="relative z-10 w-full bg-[#FCE6CB] py-20">

      {/* Edit Modal portal */}
      {isMounted && editingField && (
        <EditModal
          label={activeLabel}
          value={activeField}
          onSave={handleFieldSave}
          onClose={() => setEditingField(null)}
        />
      )}

      <div className="w-full overflow-hidden">
        <div
          id="trust-scroll"
          className="flex snap-x snap-mandatory scroll-smooth overflow-x-auto scrollbar-none"
          style={{
            gap: `${GAP}px`,
            paddingLeft: "5vw",
            paddingRight: "5vw",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="snap-center shrink-0"
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
                {/* Image */}
                <div className="p-4 sm:p-10 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl overflow-hidden aspect-[4/3] md:min-h-[400px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover block transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col justify-center p-6 sm:p-12 pl-4 sm:pl-4 gap-6">

                  {/* Title */}
                  <div
                    className={`relative group ${isAdmin ? "cursor-pointer" : ""}`}
                    onClick={() => isAdmin && setEditingField({ index: i, field: "title" })}
                  >
                    <h3
                      className={`font-serif text-3xl sm:text-6xl text-[#1A1A1A] leading-tight ${
                        isAdmin ? "group-hover:opacity-60 transition-opacity" : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                    {isAdmin && (
                      <div className="absolute top-0 left-0 -translate-y-full pb-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
                        <div className="flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit Judul
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div
                    className={`relative group ${isAdmin ? "cursor-pointer" : ""}`}
                    onClick={() => isAdmin && setEditingField({ index: i, field: "description" })}
                  >
                    <p
                      className={`text-sm sm:text-lg text-[#4A4A4A] leading-relaxed ${
                        isAdmin ? "group-hover:opacity-60 transition-opacity" : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                    {isAdmin && (
                      <div className="absolute top-0 left-0 -translate-y-full pb-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
                        <div className="flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit Deskripsi
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
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
