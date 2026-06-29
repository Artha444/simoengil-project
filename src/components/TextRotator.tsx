'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ['Kado Spesial', 'Hadiah Guru', 'Hadiah Wisuda', 'Pajangan Berharga'];

export function TextRotator() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-flex overflow-hidden h-[1.4em] align-middle">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={WORDS[idx]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-40%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-0"
        >
          {WORDS[idx]}
        </motion.span>
      </AnimatePresence>
      <span className="invisible">{WORDS.reduce((a, b) => a.length > b.length ? a : b)}</span>
    </span>
  );
}
