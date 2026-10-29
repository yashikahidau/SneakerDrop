"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const notes = [
  "The right pair does more than complete a look. It carries the choices, craft, and culture that made it worth keeping.",
  "Great design rewards a second look: the line of a sole, the weight of a material, the quiet precision of a finish.",
  "A release lasts a day. The objects that matter keep moving through wardrobes, cities, and the stories people tell.",
];

export default function FieldNotes() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const previous = () => setActive((current) => (current - 1 + notes.length) % notes.length);
  const next = () => setActive((current) => (current + 1) % notes.length);

  return (
    <section id="journal" aria-labelledby="journal-title" className="relative isolate overflow-hidden border-y border-white/10 px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_46%,rgba(211,174,55,.07),transparent_48%),linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[length:auto,72px_72px,72px_72px]" />
      <div className="mx-auto grid max-w-[1600px] gap-8 md:grid-cols-[4.5rem_minmax(0,.85fr)_minmax(0,1.15fr)] md:gap-10 lg:gap-16">
        <div className="flex items-start gap-4 border-b border-white/10 pb-4 md:flex-col md:items-center md:border-b-0 md:border-r md:pb-0 md:pr-4">
          <span className="font-display text-sm font-bold tracking-[.1em] text-[#F0D98C]">01</span>
          <span className="text-[9px] uppercase tracking-[.25em] text-white/35 md:[writing-mode:vertical-rl] md:rotate-180">Field notes</span>
          <span aria-hidden="true" className="ml-auto h-px w-10 bg-[#D3AE37]/50 md:ml-0 md:mt-4 md:h-16 md:w-px" />
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[.32em] text-[#F0D98C]">Journal / Objects in motion</p>
            <h2 id="journal-title" className="max-w-sm font-display text-3xl font-semibold uppercase leading-[.95] tracking-[-.05em] text-white sm:text-4xl">A closer look at what lasts.</h2>
          </div>
          <p className="text-[9px] uppercase tracking-[.2em] text-white/35">Publication 01 <span className="mx-2 text-[#D3AE37]">/</span> 29 Oct 2026</p>
        </div>

        <div className="min-w-0 border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:pl-12">
          <div className="flex min-h-[190px] flex-col justify-between gap-6 sm:min-h-[210px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote key={active} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: "easeOut" }} className="max-w-3xl font-display text-xl font-medium leading-[1.25] tracking-[-.025em] text-white/80 sm:text-2xl lg:text-3xl">
                <span className="mr-2 text-[#F0D98C]">“</span>{notes[active]}<span className="ml-1 text-[#F0D98C]">”</span>
              </motion.blockquote>
            </AnimatePresence>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] uppercase tracking-[.2em] text-white/35">SneakerDrop editorial <span className="mx-2 text-[#D3AE37]">/</span> {String(active + 1).padStart(2, "0")} of {String(notes.length).padStart(2, "0")}</p>
              <div className="flex gap-2">
                <button type="button" onClick={previous} aria-label="Previous field note" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-[#F0D98C]/45 hover:text-[#F0D98C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F0D98C] active:scale-95"><ArrowLeft size={16} /></button>
                <button type="button" onClick={next} aria-label="Next field note" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-[#F0D98C]/45 hover:text-[#F0D98C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F0D98C] active:scale-95"><ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
