"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import type { Sneaker } from "@/types";

interface Props {
  snk: Sneaker | null;
  onClose: () => void;
  onJoin: (sneaker: Sneaker) => void;
}

const availabilityLabel: Record<Sneaker["availability_status"], string> = {
  available: "Available now",
  coming_soon: "Limited release",
  sold_out: "Release archived",
  archived: "Archived release",
};

export default function SneakerModal({ snk, onClose, onJoin }: Props) {
  const [pendingAccess, setPendingAccess] = useState<Sneaker | null>(null);
  const completeExit = useCallback(() => {
    if (!pendingAccess) return;
    onJoin(pendingAccess);
    setPendingAccess(null);
  }, [onJoin, pendingAccess]);
  const requestAccess = (sneaker: Sneaker) => {
    setPendingAccess(sneaker);
    onClose();
  };

  return <AnimatePresence onExitComplete={completeExit}>{snk && <SneakerQuickView key={snk.id} sneaker={snk} onClose={onClose} onRequestAccess={requestAccess} />}</AnimatePresence>;
}

function SneakerQuickView({ sneaker, onClose, onRequestAccess }: { sneaker: Sneaker; onClose: () => void; onRequestAccess: (sneaker: Sneaker) => void }) {
  const dialog = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(sneaker.price);
  const releaseDate = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(sneaker.created_at));
  const soldOut = sneaker.availability_status === "sold_out" || sneaker.availability_status === "archived";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", keyboard);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keyboard);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const requestAccess = () => {
    onRequestAccess(sneaker);
  };

  return (
    <motion.div className="pointer-events-auto fixed inset-0 z-[100] flex h-[100svh] w-screen justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-2xl sm:p-4 lg:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="quick-view-title" initial={{ opacity: 0, y: 28, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.985 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="relative my-auto grid min-h-full w-full max-w-[1500px] overflow-hidden border border-white/10 bg-[#101012]/95 shadow-[0_40px_140px_rgba(0,0,0,.65)] lg:min-h-[min(850px,calc(100svh-4rem))] lg:grid-cols-[1.05fr_.95fr]">
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Close product details" className="absolute right-4 top-4 z-30 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/50 text-white/75 backdrop-blur-xl transition-colors hover:border-[#F0D98C]/50 hover:text-[#F0D98C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F0D98C] active:scale-95 sm:right-6 sm:top-6"><X size={19} /></button>

        <div className="relative min-h-[44svh] overflow-hidden bg-[radial-gradient(circle_at_50%_42%,#2b2b2e_0%,#141416_62%,#09090b_100%)] sm:min-h-[52svh] lg:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sneaker.image_url} alt={`${sneaker.name}, ${sneaker.tagline}`} fetchPriority="high" decoding="async" sizes="(min-width: 1024px) 55vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/75 via-transparent to-[#09090b]/10" />
          <p className="absolute bottom-5 left-5 max-w-[70%] text-[9px] uppercase tracking-[.25em] text-white/55 sm:bottom-8 sm:left-8">SneakerDrop / Edition 01</p>
          <p className="absolute bottom-5 right-5 flex items-center gap-2 text-[9px] uppercase tracking-[.2em] text-[#F0D98C]/75 sm:bottom-8 sm:right-8"><span className="h-1.5 w-1.5 rounded-full bg-[#F0D98C] shadow-[0_0_12px_#F0D98C]" />{availabilityLabel[sneaker.availability_status]}</p>
        </div>

        <div className="relative flex flex-col justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 sm:px-8 sm:pb-10 lg:px-[clamp(2rem,5vw,5rem)] lg:py-16">
          <p className="mb-3 text-[9px] uppercase tracking-[.35em] text-[#F0D98C]">Private product view</p>
          <p className="mb-3 max-w-xl text-[10px] uppercase tracking-[.22em] text-white/40">{sneaker.tagline}</p>
          <h2 id="quick-view-title" className="max-w-xl break-words font-display text-[clamp(2.3rem,8vw,5.5rem)] font-bold uppercase leading-[.86] tracking-[-.065em] text-white">{sneaker.name}</h2>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-y border-white/10 py-5 sm:mt-9 sm:py-6">
            <div><p className="text-[9px] uppercase tracking-[.22em] text-white/35">Current price</p><p className="mt-1 font-display text-2xl font-bold text-[#F0D98C] sm:text-3xl">{price}</p></div>
            <div className="text-right"><p className="text-[9px] uppercase tracking-[.22em] text-white/35">Release window</p><p className="mt-1 text-xs font-medium uppercase tracking-[.12em] text-white/75">{releaseDate}</p></div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-[.7fr_1.3fr] sm:gap-8">
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[.24em] text-[#F0D98C]/75">Release profile</p>
              <p className="text-sm leading-6 text-white/75">{availabilityLabel[sneaker.availability_status]}</p>
              <p className="mt-1 text-xs leading-5 text-white/35">Curated release / 2026</p>
            </div>
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[.24em] text-[#F0D98C]/75">Design notes</p>
              <p className="max-w-lg text-sm leading-6 text-white/55">{sneaker.description}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2 sm:gap-8">
            <div><p className="mb-2 text-[9px] uppercase tracking-[.24em] text-[#F0D98C]/75">Material breakdown</p><p className="text-xs leading-6 text-white/50">{sneaker.material_notes?.trim() || "Material details are not published for this release."}</p></div>
            <div><p className="mb-2 text-[9px] uppercase tracking-[.24em] text-[#F0D98C]/75">Construction</p><p className="text-xs leading-6 text-white/50">{sneaker.construction_notes?.trim() || "Construction details are not published for this release."}</p></div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <button type="button" disabled={soldOut} onClick={requestAccess} className="group inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#F0D98C] px-6 text-[10px] font-bold uppercase tracking-[.16em] text-[#09090b] transition-colors hover:bg-[#D3AE37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F0D98C] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40">{soldOut ? "Release archived" : "Secure waitlist access"}<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1" /></button>
            <button type="button" onClick={onClose} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/10 px-6 text-[10px] font-bold uppercase tracking-[.16em] text-white/65 transition-colors hover:border-white/25 hover:text-white"><ArrowDownLeft size={15} />Back to catalogue</button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
