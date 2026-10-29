"use client";

import { useCallback, useEffect, useState } from "react";
import { getSneakers } from "@/actions/sneaker-actions";
import type { Sneaker } from "@/types";
import SneakerCard from "./SneakerCard";
import SneakerModal from "./SneakerModal";
import WaitlistModal from "./WaitlistModal";

export default function SneakerCatalogue() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [quickView, setQuickView] = useState<Sneaker | null>(null);
  const [waitlistItem, setWaitlistItem] = useState<Sneaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getSneakers()
      .then((result) => {
        if (!mounted) return;
        if (result.success) setSneakers(result.data ?? []);
        else setError(result.error ?? "Unable to load the collection.");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const openWaitlist = useCallback((sneaker: Sneaker) => {
    setQuickView(null);
    setWaitlistItem(sneaker);
  }, []);
  const closeQuickView = useCallback(() => setQuickView(null), []);
  const closeWaitlist = useCallback(() => setWaitlistItem(null), []);

  return (
    <section id="drops" className="relative min-w-0 overflow-hidden px-4 py-20 sm:px-5 sm:py-24 md:px-8 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-[18rem] top-1/4 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(211,174,55,.055),transparent_68%)]" />
      <div className="relative mx-auto min-w-0 max-w-[1600px]">
        <div className="mb-9 flex min-w-0 items-end justify-between gap-4 border-b border-white/10 pb-6 sm:mb-12 sm:pb-7">
          <div className="min-w-0"><p className="mb-3 text-[9px] uppercase tracking-[.28em] text-[#F0D98C] sm:tracking-[.35em]">Current catalogue</p><h2 className="font-display text-[clamp(2.3rem,11vw,6rem)] font-bold uppercase leading-none tracking-[-.055em] text-white sm:text-[clamp(2.3rem,6vw,6rem)]">The Edit</h2></div>
          <p className="hidden shrink-0 text-right text-[10px] uppercase tracking-[.2em] text-white/35 md:block">{loading ? "Synchronizing" : `${String(sneakers.length).padStart(2, "0")} releases`}</p>
        </div>

        {loading ? (
          <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="aspect-[4/5] animate-pulse rounded-[2px] border border-white/5 bg-[#121214]" />)}</div>
        ) : error ? (
          <div role="alert" className="border border-white/10 bg-[#121214] p-6 text-sm text-white/55 sm:p-10">{error}</div>
        ) : sneakers.length === 0 ? (
          <div className="border border-white/10 bg-[#121214] p-8 text-center sm:p-12"><p className="font-display text-2xl font-bold uppercase text-white/70">The next edit is assembling</p><p className="mt-3 text-sm text-white/35">Return shortly for the release.</p></div>
        ) : (
          <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3">{sneakers.map((sneaker, index) => <SneakerCard key={sneaker.id} snk={sneaker} index={index} onView={setQuickView} />)}</div>
        )}
      </div>
      <SneakerModal snk={quickView} onClose={closeQuickView} onJoin={openWaitlist} />
      <WaitlistModal snk={waitlistItem} onClose={closeWaitlist} />
    </section>
  );
}
