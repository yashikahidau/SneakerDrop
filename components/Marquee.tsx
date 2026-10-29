"use client";

import { motion, useReducedMotion } from "framer-motion";

const phrases = [
  "Limited edition drop",
  "Secure your access",
  "SneakerDrop 2026",
  "Rare by design",
];

function TickerItems() {
  return phrases.map((phrase, index) => (
    <span key={`${phrase}-${index}`} className="inline-flex shrink-0 items-center gap-5 px-5 sm:gap-8 sm:px-8">
      <span>{phrase}</span>
      <span className="text-[#F0D98C] [text-shadow:0_0_14px_rgba(240,217,140,.5)]" aria-hidden="true">&#10038;</span>
    </span>
  ));
}

export default function Marquee() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section aria-label="Limited edition drop. Secure your access. SneakerDrop 2026. Rare by design." className="overflow-hidden border-y border-white/10 bg-[#0c0c0e] py-5 text-white/75 sm:py-6">
      <p className="sr-only">Limited edition drop. Secure your access. SneakerDrop 2026. Rare by design.</p>
      <motion.div aria-hidden="true" className="flex w-max items-center font-display text-lg font-bold uppercase leading-none tracking-[-.035em] text-[#F0D98C] will-change-transform sm:text-2xl lg:text-3xl" animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }}>
        <div className="flex items-center"><TickerItems /></div>
        <div className="flex items-center"><TickerItems /></div>
      </motion.div>
    </section>
  );
}

