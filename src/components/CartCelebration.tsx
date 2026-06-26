'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CartCelebrationProps {
  trigger: boolean;
  productImage?: string;
  cartIconRef: React.RefObject<HTMLElement | null>;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  emoji: string;
}

const EMOJIS = ['💖', '💕', '🩷', '✨', '⭐', '🌟', '💫', '🌸'];

function destPos(): { x: number; y: number } {
  return { x: window.innerWidth - 404, y: 52 };
}

function readRef(r: React.RefObject<HTMLElement | null>): { x: number; y: number } | null {
  try {
    const el = r.current;
    if (!el || !el.ownerDocument?.body.contains(el)) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    if (rect.left < -50 || rect.top < -50 || rect.left > window.innerWidth + 50) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  } catch {
    return null;
  }
}

export function CartCelebration({
  trigger,
  productImage,
  cartIconRef,
  onComplete,
}: CartCelebrationProps) {
  const [items, setItems] = useState<Array<{
    id: number; start: { x: number; y: number }; end: { x: number; y: number };
  }>>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const pid = useRef(0);
  const bid = useRef(0);

  const spawnP = useCallback((ox: number, oy: number, count: number) => {
    const pts: Particle[] = Array.from({ length: count }, (_, i) => {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.0;
      const sp = 20 + Math.random() * 90;
      return {
        id: pid.current++, x: ox, y: oy,
        dx: Math.cos(a) * sp, dy: Math.sin(a) * sp - 40,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      };
    });
    setParticles((prev) => [...prev, ...pts]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => !pts.some((n) => n.id === p.id))), 1200);
  }, []);

  const fireC = useCallback((x: number, y: number) => {
    const px = Math.min(Math.max(x / window.innerWidth, 0.05), 0.95);
    const py = Math.min(Math.max(y / window.innerHeight, 0.05), 0.95);
    confetti({ particleCount: 40, spread: 50, startVelocity: 20, origin: { x: px, y: py }, colors: ['#FF8FB1', '#FFB6C8', '#FFF', '#FFD700'], scalar: 0.75, gravity: 0.6 });
    setTimeout(() => confetti({ particleCount: 12, spread: 25, startVelocity: 8, origin: { x: px, y: py }, colors: ['#FFD700', '#FFF'], scalar: 0.4, gravity: 0.3 }), 80);
  }, []);

  useEffect(() => {
    if (!trigger) return;

    const id = Date.now() + Math.random();
    const sp = { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
    setItems((prev) => [...prev, { id, start: sp, end: sp }]);

    const timer = setTimeout(() => {
      const rp = readRef(cartIconRef);
      const dp = rp || destPos();
      const ep = { x: dp.x, y: dp.y };

      // Update this item with correct end position
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, end: ep } : it));

      spawnP(sp.x, sp.y, 6);

      const mTimer = setTimeout(() => {
        const mx = (sp.x + ep.x) / 2;
        const my = Math.min(sp.y, ep.y) - 120;
        spawnP(mx, my, 8);
      }, 250);

      const aTimer = setTimeout(() => {
        setBursts((prev) => [...prev, { id: bid.current++, x: ep.x, y: ep.y }]);
        fireC(ep.x, ep.y);
        setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== bid.current - 1)), 600);
      }, 750);

      const cTimer = setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== id));
        onComplete?.();
      }, 1100);

      return () => { clearTimeout(mTimer); clearTimeout(aTimer); clearTimeout(cTimer); };
    }, 360);

    return () => clearTimeout(timer);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Flying items */}
      <AnimatePresence>
        {items.map((item) => {
          const sx = item.start.x - 28;
          const sy = item.start.y - 28;
          const ex = item.end.x - 28;
          const ey = item.end.y - 28;
          const dx = ex - sx;
          const dy = ey - sy;
          const peak = Math.max(Math.abs(dx) * 0.18, 150);
          const n = 10;
          const xKf: number[] = [];
          const yKf: number[] = [];
          const sKf: number[] = [];
          const rKf: number[] = [];
          const oKf: number[] = [];
          const tKf: number[] = [];
          for (let i = 0; i < n; i++) {
            const p = i / (n - 1);
            tKf.push(p);
            xKf.push(sx + dx * (1 - Math.pow(1 - p, 2.4)));
            yKf.push(sy + dy * p - peak * 4 * p * (1 - p));
            sKf.push(p < 0.25 ? 1 + 0.08 * (p / 0.25) : p < 0.5 ? 1.08 - 0.08 * ((p - 0.25) / 0.25) : p < 0.85 ? 1 - 0.65 * ((p - 0.5) / 0.35) : 0.35);
            rKf.push(p < 0.3 ? -6 * (p / 0.3) : p < 0.6 ? -6 + 4 * ((p - 0.3) / 0.3) : -2 + 6 * ((p - 0.6) / 0.4));
            oKf.push(p < 0.85 ? 1 : 1 - 0.15 * ((p - 0.85) / 0.15));
          }
          return (
            <motion.div
              key={item.id}
              initial={{ x: xKf[0], y: yKf[0], scale: sKf[0], rotate: rKf[0], opacity: oKf[0] }}
              animate={{ x: xKf, y: yKf, scale: sKf, rotate: rKf, opacity: oKf }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, times: tKf, ease: [0.34, 1.26, 0.64, 1] }}
              style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, width: 56, height: 56 }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 6px 24px rgba(255,143,177,0.45)', border: '2.5px solid #FFB6C8', background: '#fff' }}>
                {productImage ? (
                  <img src={productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 36, lineHeight: '56px', textAlign: 'center', display: 'block' }}>🧸</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.6 + Math.random() * 0.8 }}
            animate={{ x: p.x + p.dx, y: p.y + p.dy, opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9997, fontSize: 16, lineHeight: 1 }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Burst rings */}
      <AnimatePresence>
        {bursts.map((b) => (
          <React.Fragment key={b.id}>
            <motion.div
              initial={{ scale: 0.4, opacity: 1, x: b.x - 24, y: b.y - 24 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ position: 'fixed', top: 0, left: 0, width: 48, height: 48, borderRadius: '50%', border: '3px solid #FFB6C8', pointerEvents: 'none', zIndex: 9996 }}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8, x: b.x - 16, y: b.y - 16 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.06 }}
              style={{ position: 'fixed', top: 0, left: 0, width: 32, height: 32, borderRadius: '50%', border: '2.5px solid #FFD700', pointerEvents: 'none', zIndex: 9996 }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.9, x: b.x - 12, y: b.y - 12 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ position: 'fixed', top: 0, left: 0, width: 24, height: 24, borderRadius: '50%', background: 'radial-gradient(circle, #FFD700, #FF8FB1)', pointerEvents: 'none', zIndex: 9996 }}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </>,
    document.body
  );
}
