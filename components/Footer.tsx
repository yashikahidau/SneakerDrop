"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, AtSign, Camera, MoveUpRight } from "lucide-react";

export default function Footer() {
  const [time, setTime] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const update = () => setTime(`${new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())} UTC`);
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <footer id="manifesto" className="border-t border-white/10 bg-[#09090b] px-4 pb-7 pt-16 sm:px-5 md:px-8 md:pt-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_.42fr] lg:gap-14">
          <div>
            <p className="mb-6 text-[10px] uppercase tracking-[.32em] text-[#F0D98C]/70 sm:tracking-[.38em]">Our manifesto</p>
            <h2 className="max-w-4xl break-words font-display text-[clamp(2.25rem,10vw,7rem)] font-bold uppercase leading-[.86] tracking-[-.055em] text-white sm:text-[clamp(2.5rem,7vw,7rem)]">Rare by design.<br /><span className="text-white/20">Yours by intent.</span></h2>
          </div>
          <div className="self-end">
            <p className="mb-5 max-w-sm text-sm leading-7 text-white/48">SneakerDrop curates exceptional silhouettes for collectors who move culture forward. No noise. No restocks. Just the right pair, at the right moment.</p>
            <form onSubmit={submit} className="flex min-h-14 border-b border-white/20 py-3">
              <label htmlFor="newsletter" className="sr-only">Newsletter email</label>
              <input id="newsletter" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={submitted ? "Transmission received" : "Enter your email"} className="min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-white/35" />
              <button type="submit" aria-label="Subscribe" className="grid h-11 w-11 shrink-0 place-items-center text-[#F0D98C] transition-transform hover:translate-x-1 active:scale-95"><ArrowUpRight size={20} /></button>
            </form>
          </div>
        </div>
        <div className="mt-12 grid items-start gap-7 border-t border-white/10 pt-6 md:mt-16 md:grid-cols-3 md:items-end md:gap-8 md:pt-7">
          <div className="flex gap-2">
            <a href="https://instagram.com" aria-label="Instagram" className="grid h-11 w-11 place-items-center text-white/50 transition-colors hover:text-[#F0D98C]"><Camera size={18} /></a>
            <a href="https://twitter.com" aria-label="Twitter" className="grid h-11 w-11 place-items-center text-white/50 transition-colors hover:text-[#F0D98C]"><AtSign size={18} /></a>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[.16em] text-white/45 sm:text-[10px] sm:tracking-[.2em] md:justify-self-center"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />System operational <span className="ml-1 tabular-nums sm:ml-2">{time}</span></div>
          <a href="#top" className="flex min-h-11 items-center gap-2 text-[10px] uppercase tracking-[.2em] text-white/55 transition-colors hover:text-white md:justify-self-end">Back to top<MoveUpRight size={14} /></a>
        </div>
      </div>
    </footer>
  );
}
