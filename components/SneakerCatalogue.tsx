"use client";

import { useCallback, useEffect, useState } from "react";
import { getSneakers } from "@/actions/sneaker-actions";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Sneaker } from "@/types";
import SneakerCard, { type SneakerCardLayout } from "./SneakerCard";
import SneakerModal from "./SneakerModal";
import WaitlistModal from "./WaitlistModal";

function getLayout(index: number, count: number): SneakerCardLayout {
  if (count === 1) return "banner";
  if (count === 2) return index === 0 ? "feature" : "banner";
  if (index === 0) return "feature";
  if (index === 1) return "side";
  if (index === 2) return "banner";

  const remainder = count - 3;
  const remainderIndex = index - 3;
  if (remainder % 3 === 1 && remainderIndex === remainder - 1) return "banner";
  if (remainder % 3 === 2 && remainderIndex === 0) return "center-tile";
  return "tile";
}

export default function SneakerCatalogue() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [quickView, setQuickView] = useState<Sneaker | null>(null);
  const [waitlistItem, setWaitlistItem] = useState<Sneaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabaseBrowser.channel> | null = null;

    const loadCatalogue = async () => {
      try {
        const result = await getSneakers();
        if (!mounted) return;
        if (result.success) setSneakers(result.data ?? []);
        else setError(result.error ?? "Unable to load the collection.");
      } catch {
        if (mounted) setError("Unable to load the collection. Please refresh to try again.");
      } finally {
        if (mounted) setLoading(false);
      }

      if (!mounted) return;
      channel = supabaseBrowser
        .channel("public-sneaker-catalogue")
        .on("postgres_changes", { event: "*", schema: "public", table: "sneakers" }, (payload) => {
          if (payload.eventType === "DELETE") {
            const removedId = (payload.old as Partial<Sneaker>).id;
            if (removedId) setSneakers((current) => current.filter((sneaker) => sneaker.id !== removedId));
            return;
          }

          const updated = payload.new as unknown as Sneaker;
          if (!updated.id) return;
          setSneakers((current) => {
            if (updated.availability_status === "archived") {
              return current.filter((sneaker) => sneaker.id !== updated.id);
            }
            const existing = current.some((sneaker) => sneaker.id === updated.id);
            const next = existing
              ? current.map((sneaker) => sneaker.id === updated.id ? updated : sneaker)
              : [updated, ...current];
            return next.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
          });
        })
        .subscribe();
    };

    void loadCatalogue();
    return () => {
      mounted = false;
      if (channel) void supabaseBrowser.removeChannel(channel);
    };
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
          <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            <div className="col-span-1 aspect-[4/3] animate-pulse bg-[linear-gradient(120deg,#101012,#1a1a1c_48%,#101012)] md:col-span-2 sm:aspect-[16/8] lg:aspect-[2.15/1]" />
            <div className="col-span-1 aspect-[4/3] animate-pulse bg-[linear-gradient(120deg,#101012,#1a1a1c_48%,#101012)]" />
            <div className="col-span-1 aspect-[4/3] animate-pulse bg-[linear-gradient(120deg,#101012,#1a1a1c_48%,#101012)] md:col-span-2 lg:col-span-3 lg:aspect-[2.7/1]" />
          </div>
        ) : error ? (
          <div role="alert" className="border-y border-white/10 py-10 text-sm text-white/55">{error}</div>
        ) : sneakers.length === 0 ? (
          <div className="border-y border-white/10 py-12 sm:py-16"><p className="font-display text-2xl font-bold uppercase text-white/70 sm:text-3xl">The next edit is assembling</p><p className="mt-3 max-w-md text-sm leading-6 text-white/40">Return for the next curated release.</p></div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {sneakers.map((sneaker, index) => <SneakerCard key={sneaker.id} snk={sneaker} index={index} layout={getLayout(index, sneakers.length)} onView={setQuickView} />)}
          </div>
        )}
      </div>
      <SneakerModal snk={quickView} onClose={closeQuickView} onJoin={openWaitlist} />
      <WaitlistModal snk={waitlistItem} onClose={closeWaitlist} />
    </section>
  );
}
