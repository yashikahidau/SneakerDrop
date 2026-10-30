"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Loader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("hasVisited") === "true") return;
    } catch {
      // Storage can be unavailable in private browsing; the intro still runs once per mount.
    }

    const started = performance.now();
    const duration = 1450;
    let frame = 0;
    let timeout = 0;

    const tick = (now: number) => {
      const elapsed = now - started;
      setProgress(Math.min(100, Math.round((elapsed / duration) * 100)));
      if (elapsed < duration) frame = requestAnimationFrame(tick);
      else timeout = window.setTimeout(() => {
        try {
          window.sessionStorage.setItem("hasVisited", "true");
        } catch {
          // The intro has completed even when session storage is unavailable.
        }
        setVisible(false);
      }, 180);
    };

    frame = requestAnimationFrame(() => {
      setVisible(true);
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[120] flex items-end justify-between gap-2 overflow-hidden bg-[#09090b] px-4 pb-8 text-[#F0D98C] sm:gap-6 sm:px-6 sm:pb-10 md:px-12 md:pb-14" exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 top-0 h-px origin-left bg-[#D3AE37]" style={{ transform: `scaleX(${progress / 100})` }} />
          <div className="min-w-0 flex-1">
            <p className="mb-2 max-w-full text-[8px] uppercase tracking-[.24em] text-white/40 sm:text-[10px] sm:tracking-[.45em]">Limited releases / global</p>
            <p className="whitespace-nowrap font-display text-[clamp(1.5rem,5vw,3rem)] font-bold uppercase leading-none tracking-[-.045em]">SneakerDrop</p>
          </div>
          <motion.span key={progress} initial={{ opacity: 0.3, y: 8 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 font-display text-[clamp(2.5rem,16vw,11rem)] font-bold leading-none tabular-nums md:text-[11rem]">{progress}</motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
