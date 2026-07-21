"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Check, X } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert <br> / <br/> tags → newlines for the textarea */
export function brToNl(text: string): string {
  return text.replace(/<br\s*\/?>/gi, "\n");
}

/** Convert newlines → <br> for HTML storage */
export function nlToBr(text: string): string {
  return text.replace(/\n/g, "<br>");
}

// ── Shared Edit Modal ─────────────────────────────────────────────────────────

interface EditModalProps {
  /** Human-readable label shown in the modal header */
  label: string;
  /** Current raw value (may contain <br> tags) */
  value: string;
  onSave: (newValue: string) => Promise<void>;
  onClose: () => void;
}

export function EditModal({ label, value, onSave, onClose }: EditModalProps) {
  // Convert stored <br> → \n so the textarea shows natural line breaks
  const [text, setText] = useState(() => brToNl(value));
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    const t = setTimeout(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }, 60);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert \n → <br> before saving so HTML renders correctly
      await onSave(nlToBr(text));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl z-10 overflow-hidden"
        style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber accent bar at top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400" />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Pencil className="w-4.5 h-4.5 text-black" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Admin · Edit Konten
                </p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 leading-snug">
                  {label}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Hint row */}
          <div className="flex items-center gap-1.5 mb-3 text-[11px] text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
            <span>💡</span>
            <span>
              Tekan{" "}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono font-bold text-slate-600 shadow-sm">
                Shift
              </kbd>{" "}
              +{" "}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono font-bold text-slate-600 shadow-sm">
                Enter
              </kbd>{" "}
              untuk pindah baris baru
            </span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Shift+Enter: native textarea behavior already adds \n — no override needed.
              // We just block plain Enter from accidentally closing (no default submit here).
            }}
            rows={6}
            className="w-full p-4 border-2 border-slate-200 focus:border-amber-400 rounded-2xl outline-none resize-y text-slate-700 font-sans text-sm leading-relaxed transition-colors min-h-[120px]"
            placeholder="Ketik teks di sini…"
          />

          {/* Char count */}
          <p className="text-right text-[10px] text-slate-300 mt-1 mb-5">
            {text.length} karakter
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-black font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              {isSaving ? "Menyimpan…" : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe for modal entry animation */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── Editable Component ────────────────────────────────────────────────────────

interface EditableProps {
  isAdmin: boolean;
  itemKey: string;
  initialValue: string;
  onSave: (key: string, value: string) => Promise<void>;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Optional render prop for custom HTML rendering (e.g. dangerouslySetInnerHTML) */
  children?: (value: string) => React.ReactNode;
}

export const Editable: React.FC<EditableProps> = ({
  isAdmin,
  itemKey,
  initialValue,
  onSave,
  as: Component = "span",
  className = "",
  children,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only render portal after client-side mount
  useEffect(() => setIsMounted(true), []);

  // Sync when parent updates initialValue (e.g. after Supabase fetch)
  useEffect(() => setValue(initialValue), [initialValue]);

  const handleSave = async (newValue: string) => {
    await onSave(itemKey, newValue);
    setValue(newValue);
  };

  // ── Non-admin: clean render with Component + className ──────────────────────
  if (!isAdmin) {
    if (children) {
      return <Component className={className}>{children(value)}</Component>;
    }
    // Support <br> tags stored in plain-text fields
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  // ── Admin: clickable text + modal ───────────────────────────────────────────
  // Build a friendly label from the itemKey
  const label = itemKey
    .replace(/\./g, " → ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  return (
    <>
      {/* Portal modal — only renders after mount */}
      {isMounted && isModalOpen && (
        <EditModal
          label={label}
          value={value}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Clickable text wrapper */}
      <div
        className="relative group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        title="Klik untuk mengedit"
      >
        {/* The actual styled text */}
        <Component
          className={`${className} transition-opacity duration-150 group-hover:opacity-60`}
        >
          {children
            ? children(value)
            : <span dangerouslySetInnerHTML={{ __html: value }} />}
        </Component>

        {/* "✏️ Edit" badge — fades in on hover, top-left of the element */}
        <div className="absolute top-0 left-0 -translate-y-full pb-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 pointer-events-none">
          <div className="flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
            <Pencil className="w-2.5 h-2.5" />
            Edit
          </div>
        </div>
      </div>
    </>
  );
};