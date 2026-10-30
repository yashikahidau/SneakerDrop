"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Drops", href: "#drops" },
  { label: "Manifesto", href: "#manifesto" },
  { label: "Journal", href: "#journal" },
];

const menuVariants = {
  closed: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
  open: { transition: { delayChildren: 0.16, staggerChildren: 0.1 } },
};

const linkVariants = {
  closed: { opacity: 0, y: 24 },
  open: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = triggerRef.current;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
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
    document.addEventListener("keydown", keyboard);
    const focusFrame = window.requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true }));
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keyboard);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open]);

  const scrollToDrops = () => document.querySelector("#drops")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-2xl">
        <nav className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-4 sm:px-6 md:px-8" aria-label="Primary navigation">
          <a href="#top" className="group flex min-w-0 items-center gap-2 sm:gap-3" aria-label="SneakerDrop home" onClick={() => setOpen(false)}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#D3AE37]/50 bg-[#D3AE37]/10 font-display text-sm font-bold text-[#F0D98C] shadow-[0_0_24px_rgba(211,174,55,.15)]">SD</span>
            <span className="whitespace-nowrap font-display text-xs font-bold uppercase tracking-[.12em] text-white sm:text-sm sm:tracking-[.22em]">SneakerDrop</span>
          </a>
          <div className="hidden items-center gap-9 md:flex">
            {links.map((link) => <a key={link.href} href={link.href} data-cursor-label="EXPLORE" className="nav-link text-xs font-semibold uppercase tracking-[.18em] text-white/65">{link.label}</a>)}
          </div>
          <button onClick={scrollToDrops} data-cursor="active" data-cursor-label="EXPLORE" className="magnetic hidden min-h-12 min-w-[150px] items-center justify-center rounded-full bg-[#F0D98C] px-6 py-3 text-xs font-bold uppercase tracking-[.16em] text-[#09090b] transition-transform hover:-translate-y-0.5 hover:bg-[#D3AE37] active:scale-[.98] md:flex">Join Drop</button>
          <button ref={triggerRef} onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="mobile-navigation" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-[#F0D98C]/50 hover:text-[#F0D98C] active:scale-95 md:hidden">
            <Menu size={20} aria-hidden="true" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div ref={menuRef} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Mobile navigation" className="fixed inset-0 z-[60] flex h-[100svh] w-screen flex-col overflow-y-auto bg-black/95 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 backdrop-blur-2xl md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <div className="flex h-[72px] items-center justify-between border-b border-white/10">
              <a href="#top" onClick={() => setOpen(false)} className="whitespace-nowrap font-display text-xs font-bold uppercase tracking-[.16em] text-white sm:text-sm sm:tracking-[.2em]">SneakerDrop</a>
              <button onClick={() => setOpen(false)} aria-label="Close navigation menu" className="grid h-12 w-12 place-items-center rounded-full border border-[#F0D98C]/40 bg-[#F0D98C]/10 text-[#F0D98C] transition-colors hover:bg-[#F0D98C]/20 active:scale-95"><X size={22} /></button>
            </div>
            <motion.nav aria-label="Mobile navigation links" variants={menuVariants} initial="closed" animate="open" exit="closed" className="my-auto flex flex-col py-12">
              {links.map((link, index) => (
                <motion.a key={link.href} variants={linkVariants} href={link.href} data-cursor-label="EXPLORE" onClick={() => setOpen(false)} className="flex min-h-[76px] items-center gap-5 border-b border-white/10 py-5 font-display text-[clamp(2.2rem,11vw,4.5rem)] font-bold uppercase leading-none tracking-[-.05em] text-white transition-colors hover:text-[#F0D98C]">
                  <span className="font-sans text-[10px] font-medium tracking-[.18em] text-[#F0D98C]/65">0{index + 1}</span>{link.label}
                </motion.a>
              ))}
            </motion.nav>
            <button onClick={() => { setOpen(false); window.setTimeout(scrollToDrops, 100); }} className="min-h-14 w-full rounded-full bg-[#F0D98C] px-6 text-xs font-bold uppercase tracking-[.18em] text-[#09090b] active:scale-[.99]">Join Drop</button>
            <p className="mt-5 text-center text-[9px] uppercase tracking-[.25em] text-white/35">Rare by design · Edition 01</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
