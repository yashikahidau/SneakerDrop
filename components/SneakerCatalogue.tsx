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
    <section id="drops" className="relative min-w-0 overflow-hidden px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-[18rem] top-[15%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(211,174,55,.06),transparent_68%)]" />
      <div className="relative mx-auto min-w-0 max-w-[1720px]">
        <header className="mb-10 flex items-end justify-between gap-4 border-b border-white/10 pb-6 sm:mb-14 sm:pb-8">
          <div><p className="mb-3 text-[9px] uppercase tracking-[.3em] text-[#F0D98C] sm:tracking-[.36em]">Current catalogue / Issue 01</p><h2 className="font-display text-[clamp(2.5rem,9vw,7rem)] font-bold uppercase leading-[.88] tracking-[-.065em] text-white">The Edit</h2></div>
          <p className="hidden pb-1 text-right text-[9px] uppercase tracking-[.2em] text-white/35 sm:block">{loading ? "Synchronizing releases" : `${String(sneakers.length).padStart(2, "0")} curated releases`}</p>
        </header>

        {loading ? (
          <div className="space-y-12 sm:space-y-16">
            <div className="aspect-[4/3] animate-pulse bg-[linear-gradient(120deg,#101012,#1a1a1c_48%,#101012)] sm:aspect-[16/8]" />
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-2"><div className="aspect-[4/3] animate-pulse bg-[linear-gradient(120deg,#101012,#1a1a1c_48%,#101012)]" /><div className="aspect-[4/3] animate-pulse bg-[linear-gradient(120deg,#101012,#1a1a1c_48%,#101012)] md:mt-20" /></div>
          </div>
        ) : error ? (
          <div role="alert" className="border-y border-white/10 py-10 text-sm text-white/55">{error}</div>
        ) : sneakers.length === 0 ? (
          <div className="border-y border-white/10 py-12 sm:py-16"><p className="font-display text-2xl font-bold uppercase text-white/70 sm:text-3xl">The next edit is assembling</p><p className="mt-3 max-w-md text-sm leading-6 text-white/40">Return for the next curated release.</p></div>
        ) : (
          <div className="space-y-14 sm:space-y-20 lg:space-y-24">
            <SneakerCard snk={sneakers[0]} index={0} layout="feature" onView={setQuickView} />
            {sneakers.length > 1 && (
              <div className="grid min-w-0 gap-x-7 gap-y-14 sm:gap-x-10 sm:gap-y-20 md:grid-cols-2 lg:gap-x-16">
                {sneakers.slice(1).map((sneaker, restIndex) => {
                  const last = restIndex === sneakers.length - 2;
                  const isSingle = sneakers.length === 2;
                  const isOddRemainder = (sneakers.length - 1) % 2 === 1;
                  const layout = isSingle || (isOddRemainder && last) ? "wide" : "editorial";
                  return <SneakerCard key={sneaker.id} snk={sneaker} index={restIndex + 1} layout={layout} offset={restIndex % 2 === 1 && layout === "editorial"} onView={setQuickView} />;
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <SneakerModal snk={quickView} onClose={closeQuickView} onJoin={openWaitlist} />
      <WaitlistModal snk={waitlistItem} onClose={closeWaitlist} />
    </section>
  );
}
