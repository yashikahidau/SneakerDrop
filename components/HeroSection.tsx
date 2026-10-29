"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, Asterisk } from "lucide-react";

export default function HeroSection() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const rotateZ = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const orbX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const orbY = useTransform(sy, [-0.5, 0.5], [-18, 18]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (event: MouseEvent) => {
      mx.set(event.clientX / window.innerWidth - 0.5);
      my.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  const explore = () => document.querySelector("#drops")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="top" className="relative flex min-h-[100svh] overflow-hidden px-4 pt-[72px] sm:px-5 md:px-8">
      <div className="hero-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="absolute left-[-15%] top-[-10%] h-[55vw] w-[55vw] rounded-full bg-[#D3AE37]/5 blur-[100px] md:blur-[140px]" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col justify-between py-8 sm:py-10 md:py-14">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[.25em] text-white/40 sm:tracking-[.35em]">Edition 01 — 2026</p>
          <p className="hidden items-center gap-2 text-[9px] uppercase tracking-[.35em] text-white/40 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#F0D98C] shadow-[0_0_12px_#F0D98C]" />Selections live</p>
        </div>
        <div className="relative z-20 my-auto py-12 sm:py-16 md:py-12">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }} className="mb-5 text-[10px] uppercase tracking-[.3em] text-[#F0D98C] sm:text-xs sm:tracking-[.4em]">The collectors&apos; edit</motion.p>
          <h1 className="font-display text-[clamp(2.65rem,12.2vw,12rem)] font-bold uppercase leading-[.8] tracking-[-.075em] text-white sm:text-[clamp(4rem,12vw,12rem)]">
            <span className="block overflow-hidden pb-[.08em]"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 1.55, duration: 1, ease: [0.76, 0, 0.24, 1] }} className="block">OWN THE</motion.span></span>
            <span className="block overflow-hidden pb-[.08em]"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 1.65, duration: 1, ease: [0.76, 0, 0.24, 1] }} className="block text-outline">UNSEEN.</motion.span></span>
          </h1>
        </div>
        <motion.div style={{ rotateX, rotateY, rotateZ, x: orbX, y: orbY, transformPerspective: 900 }} className="pointer-events-none absolute right-[-18%] top-[31%] z-0 aspect-square w-[min(48vw,520px)] rounded-full border border-[#F0D98C]/10 opacity-45 sm:right-[2%] sm:w-[min(38vw,520px)] sm:opacity-100 md:right-[8%]" aria-hidden="true">
          <div className="absolute inset-[12%] animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-white/10"><Asterisk className="absolute -right-4 top-1/2 h-8 w-8 text-[#F0D98C]/60" /></div>
          <div className="absolute inset-[28%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#F0D98C55,#18181b_42%,#09090b_75%)] shadow-[0_0_100px_rgba(240,217,140,.08)]" />
        </motion.div>
        <div className="pointer-events-none absolute right-[2%] top-[29%] z-20 rounded-xl border border-white/10 bg-[#121214]/80 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,.25)] backdrop-blur-2xl sm:right-[9%] sm:px-4 sm:py-3"><p className="text-[8px] uppercase tracking-[.25em] text-white/40">Next drop</p><p className="mt-1 font-display text-sm font-bold text-[#F0D98C]">03 / 14</p></div>
        <div className="relative z-10 flex items-end justify-between gap-4">
          <button onClick={explore} className="group flex min-h-12 items-center gap-3 text-[9px] uppercase tracking-[.2em] text-white/55 transition-colors hover:text-[#F0D98C] active:scale-[.98] sm:gap-4 sm:text-[10px] sm:tracking-[.25em]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-[#F0D98C]/50"><ArrowDown size={16} /></span>Explore edit</button>
          <p className="hidden max-w-[290px] text-right text-xs leading-6 text-white/38 md:block">A measured collection of future icons, limited in number and deliberate in character.</p>
        </div>
      </div>
    </section>
  );
}
