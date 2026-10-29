"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import type { Sneaker } from "@/types";

export type SneakerCardLayout = "feature" | "side" | "banner" | "tile" | "center-tile";

interface Props {
  snk: Sneaker;
  index: number;
  layout: SneakerCardLayout;
  onView: (sneaker: Sneaker) => void;
}

const availability: Record<Sneaker["availability_status"], { label: string; dot: string }> = {
  available: { label: "In stock", dot: "bg-emerald-400" },
  coming_soon: { label: "Limited drop", dot: "bg-[#F0D98C]" },
  sold_out: { label: "Sold out", dot: "bg-white/35" },
};

export default function SneakerCard({ snk, index, layout, onView }: Props) {
  const card = useRef<HTMLElement>(null);
  const imageFrame = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const spotlightOpacity = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 190, damping: 28, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 190, damping: 28, mass: 0.35 });
  const springOpacity = useSpring(spotlightOpacity, { stiffness: 180, damping: 24 });
  const rotateX = useTransform(springY, [0, 100], [2.4, -2.4]);
  const rotateY = useTransform(springX, [0, 100], [-2.4, 2.4]);
  const spotlight = useMotionTemplate`radial-gradient(460px circle at ${springX}% ${springY}%, rgba(240,217,140,.15), rgba(211,174,55,.06) 34%, transparent 74%)`;
  const status = availability[snk.availability_status];
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(snk.price);
  const displayIndex = String(index + 1).padStart(2, "0");
  const cinematic = layout === "feature" || layout === "banner";

  const move = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !card.current) return;
    const cardRect = card.current.getBoundingClientRect();
    pointerX.set(((event.clientX - cardRect.left) / cardRect.width) * 100);
    pointerY.set(((event.clientY - cardRect.top) / cardRect.height) * 100);
    if (imageFrame.current?.contains(event.target as Node)) {
      const imageRect = imageFrame.current.getBoundingClientRect();
      pointerX.set(((event.clientX - imageRect.left) / imageRect.width) * 100);
      pointerY.set(((event.clientY - imageRect.top) / imageRect.height) * 100);
      spotlightOpacity.set(1);
    } else {
      spotlightOpacity.set(0);
    }
  };

  const leave = () => {
    pointerX.set(50);
    pointerY.set(50);
    spotlightOpacity.set(0);
  };
  const open = () => onView(snk);
  const click = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.focus({ preventScroll: true });
    open();
  };
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  const layoutClass: Record<SneakerCardLayout, string> = {
    feature: "col-span-1 md:col-span-2",
    side: "col-span-1",
    banner: "col-span-1 md:col-span-2 lg:col-span-3",
    tile: "col-span-1",
    "center-tile": "col-span-1 lg:col-start-2",
  };
  const imageRatio = layout === "feature"
    ? "aspect-[4/3] sm:aspect-[16/8] lg:aspect-[2.15/1]"
    : layout === "banner"
      ? "aspect-[4/3] sm:aspect-[16/8] lg:aspect-[2.7/1]"
      : "aspect-[4/3]";

  return (
    <motion.article
      ref={card}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`View ${snk.name} release`}
      data-cursor="active"
      data-cursor-label="VIEW"
      onClick={click}
      onKeyDown={keyDown}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 42, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: layout === "feature" ? 1.006 : 1.012 }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.76, delay: (index % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`sneaker-card group relative min-w-0 cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#F0D98C] ${layoutClass[layout]}`}
    >
      <div ref={imageFrame} className={`relative isolate overflow-hidden bg-transparent ${imageRatio}`}>
        <span aria-hidden="true" className={`pointer-events-none absolute z-[25] select-none font-display font-bold leading-none tracking-[-.09em] text-white/[.09] mix-blend-screen ${cinematic ? "-left-2 top-0 text-[clamp(9rem,24vw,24rem)]" : "-left-3 -top-10 text-[clamp(8rem,20vw,17rem)] md:-left-8 md:-top-16"}`}>{displayIndex}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={snk.image_url} alt={`${snk.name} — ${snk.tagline}`} loading={index < 3 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105 group-focus-visible:scale-[1.03]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#09090b]/85 via-[#09090b]/10 to-[#09090b]/20" />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30" style={{ backgroundImage: spotlight, opacity: springOpacity }} />

        {cinematic ? (
          <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col justify-end gap-4 p-5 sm:p-8 md:flex-row md:items-end md:justify-between md:p-10 ${layout === "feature" ? "lg:p-14" : "lg:p-10"}`}>
            <div className="max-w-3xl">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[.28em] text-[#F0D98C] sm:text-[10px] sm:tracking-[.35em]">Edition 01 / Archival <span className="mx-2 text-white/40">·</span>{status.label}</p>
              <p className="mb-2 max-w-xl text-[9px] uppercase tracking-[.2em] text-white/65 sm:text-[10px]">{snk.tagline}</p>
              <h3 className={`break-words font-display font-bold uppercase leading-[.86] tracking-[-.07em] text-white ${layout === "feature" ? "text-[clamp(2.3rem,8vw,7.2rem)]" : "text-[clamp(2rem,6vw,5rem)]"}`}>{snk.name}</h3>
              <p className="mt-4 hidden max-w-xl text-sm leading-6 text-white/60 md:block">{snk.description}</p>
            </div>
            <div className="flex shrink-0 items-end justify-between gap-8 md:flex-col md:items-end md:gap-4">
              <p className="font-display text-xl font-semibold text-[#F0D98C] sm:text-2xl">{price}</p>
              <span className="inline-flex min-h-11 items-center gap-3 border-b border-white/60 pb-2 text-[9px] font-bold uppercase tracking-[.2em] text-white transition-colors group-hover:border-[#F0D98C] group-hover:text-[#F0D98C]">Explore release<ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 p-4 sm:p-6">
            <p className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[.2em] text-white/70"><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</p>
            <p className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#F0D98C]">Release {displayIndex}</p>
          </div>
        )}
      </div>

      {!cinematic && (
        <div className="mt-5 sm:mt-7">
          <p className="mb-2 text-[9px] uppercase tracking-[.24em] text-[#F0D98C]/70">{snk.tagline}</p>
          <div className="flex items-end justify-between gap-4">
            <h3 className="max-w-[75%] break-words font-display text-[clamp(1.65rem,4vw,3rem)] font-bold uppercase leading-[.9] tracking-[-.055em] text-white">{snk.name}</h3>
            <p className="shrink-0 pb-0.5 font-display text-base font-semibold text-[#F0D98C] sm:text-lg">{price}</p>
          </div>
          <p className="mt-4 max-w-xl text-xs leading-6 text-white/45">{snk.description}</p>
          <span className="mt-5 inline-flex min-h-10 items-center gap-3 border-b border-white/35 pb-2 text-[9px] font-bold uppercase tracking-[.18em] text-white/80 transition-colors group-hover:border-[#F0D98C] group-hover:text-[#F0D98C]">Explore release<ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
        </div>
      )}
    </motion.article>
  );
}
