"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, X } from "lucide-react";
import { joinWaitlist } from "@/actions/waitlist-actions";
import type { Sneaker } from "@/types";

interface Props { snk: Sneaker | null; onClose: () => void; }
const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

export default function WaitlistModal({ snk, onClose }: Props) {
  const sneaker = snk;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const valid = emailPattern.test(email.trim()) && email.trim().length <= 254;

  useEffect(() => {
    if (!sneaker) return;
    setEmail(""); setSuccess(false); setMessage(""); setLoading(false);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [sneaker, onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sneaker || !valid) return;
    setLoading(true); setMessage("");
    const result = await joinWaitlist(sneaker.id, email.trim());
    setLoading(false);
    if (result.success) setSuccess(true);
    setMessage(result.message);
  };

  return (
    <AnimatePresence>
      {sneaker && (
        <motion.div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/75 backdrop-blur-xl md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="waitlist-title" initial={{ opacity: 0, y: 40, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: .98 }} className="relative w-full max-w-[840px] overflow-hidden border border-white/10 bg-[#121214]/95 shadow-[0_30px_100px_rgba(0,0,0,.7)] backdrop-blur-2xl md:grid md:grid-cols-[.75fr_1fr] md:rounded-sm">
            <button onClick={onClose} aria-label="Close waitlist" className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/30 text-white/60"><X size={16} /></button>
            <div className="relative hidden min-h-[510px] overflow-hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sneaker.image_url} alt={sneaker.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
            </div>
            <div className="flex min-h-[440px] flex-col justify-center p-7 md:min-h-[510px] md:p-12">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180 }} className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-full border border-[#F0D98C]/40 bg-[#F0D98C]/10 text-[#F0D98C]"><Check size={34} /></motion.div>
                    <h2 className="font-display text-3xl font-bold uppercase text-white">Access secured</h2>
                    <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/45">{message} Watch your inbox for release intelligence.</p>
                    <button onClick={onClose} className="mt-8 rounded-full border border-white/10 px-7 py-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/70">Return to edit</button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="mb-3 text-[9px] uppercase tracking-[.32em] text-[#F0D98C]">Private access</p>
                    <h2 id="waitlist-title" className="font-display text-4xl font-bold uppercase leading-[.9] tracking-[-.05em] text-white md:text-5xl">Join the<br />waitlist</h2>
                    <div className="mt-7 flex items-center justify-between border-y border-white/10 py-4">
                      <div><p className="font-display text-sm font-bold uppercase text-white">{sneaker.name}</p><p className="mt-1 text-[9px] uppercase tracking-[.18em] text-white/35">{sneaker.tagline}</p></div>
                      <p className="font-display text-lg font-bold text-[#F0D98C]">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(sneaker.price)}</p>
                    </div>
                    <form onSubmit={submit} className="mt-7">
                      <label htmlFor="waitlist-email" className="mb-2 block text-[9px] uppercase tracking-[.22em] text-white/45">Email address</label>
                      <div className={`rounded-sm border bg-black/20 ${email && valid ? "border-[#F0D98C]/55" : email ? "border-red-400/50" : "border-white/10 focus-within:border-[#F0D98C]/55"}`}><input id="waitlist-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="collector@email.com" className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-white/20" /></div>
                      {email && !valid && <p className="mt-2 text-xs text-red-300/80">Enter a valid email address.</p>}
                      {message && <p className="mt-3 text-xs leading-5 text-[#F0D98C]">{message}</p>}
                      <button disabled={!valid || loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#F0D98C] py-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#09090b] disabled:opacity-35">{loading ? <><LoaderCircle size={15} className="animate-spin" />Securing access</> : "Request access"}</button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
