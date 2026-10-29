"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import type { Sneaker } from "@/types";

type Layout = "feature" | "editorial" | "wide";

interface Props {
  snk: Sneaker;
  index: number;
  layout: Layout;
  offset?: boolean;
  onView: (sneaker: Sneaker) => void;
}

const availability: Record<Sneaker["availability_status"], { label: string; dot: string }> = {
  available: { label: "In stock", dot: "bg-emerald-400" },
  coming_soon: { label: "Limited drop", dot: "bg-[#F0D98C]" },
  sold_out: { label: "Sold out", dot: "bg-white/35" },
};

export default function SneakerCard({ snk, index, layout, offset = false, onView }: Props) {
  const card = useRef<HTMLElement>(null);
  const imageFrame = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const pointerOpacity = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 190, damping: 28, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 190, damping: 28, mass: 0.35 });
  const springOpacity = useSpring(pointerOpacity, { stiffness: 180, damping: 24 });
  const rotateX = useTransform(springY, [0, 100], [2.5, -2.5]);
  const rotateY = useTransform(springX, [0, 100], [-2.5, 2.5]);
  const spotlight = useMotionTemplate`radial-gradient(440px circle at ${springX}% ${springY}%, rgba(240,217,140,0.14), rgba(211,174,55,0.055) 32%, transparent 72%)`;
  const status = availability[snk.availability_status];
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(snk.price);
  const displayIndex = String(index + 1).padStart(2, "0");

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !card.current) return;
    const cardBounds = card.current.getBoundingClientRect();
    pointerX.set(((event.clientX - cardBounds.left) / cardBounds.width) * 100);
    pointerY.set(((event.clientY - cardBounds.top) / cardBounds.height) * 100);

    if (imageFrame.current?.contains(event.target as Node)) {
      const imageBounds = imageFrame.current.getBoundingClientRect();
      pointerX.set(((event.clientX - imageBounds.left) / imageBounds.width) * 100);
      pointerY.set(((event.clientY - imageBounds.top) / imageBounds.height) * 100);
      pointerOpacity.set(1);
    } else {
      pointerOpacity.set(0);
    }
  };

  const handlePointerLeave = () => {
    pointerX.set(50);
    pointerY.set(50);
    pointerOpacity.set(0);
  };

  const open = () => onView(snk);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.focus({ preventScroll: true });
    open();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  const feature = layout === "feature";
  const wide = layout === "wide";

  return (
    <motion.article
      ref={card}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Explore ${snk.name} details`}
      data-cursor="active"
      data-cursor-label="EXPLORE"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 42, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: feature ? 1.006 : 1.012 }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.78, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`sneaker-card group relative min-w-0 cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#F0D98C] ${feature ? "" : wide ? "md:col-span-2 md:grid md:grid-cols-[1.15fr_.85fr] md:items-center md:gap-8 lg:gap-14" : ""} ${offset ? "md:mt-20" : ""}`}
    >
      <div className={`relative isolate overflow-hidden ${feature ? "aspect-[4/3] sm:aspect-[16/8] lg:aspect-[2.1/1]" : "aspect-[4/3]"}`} ref={imageFrame}>
        <span aria-hidden="true" className={`pointer-events-none absolute z-[25] select-none font-display font-bold leading-none tracking-[-.09em] text-white/[.09] mix-blend-screen ${feature ? "-left-2 top-0 text-[clamp(9rem,24vw,24rem)]" : "-left-3 -top-10 text-[clamp(8rem,20vw,17rem)] md:-left-8 md:-top-16"}`}>{displayIndex}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={snk.image_url} alt={`${snk.name} — ${snk.tagline}`} loading={index < 3 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105 group-focus-visible:scale-[1.03]" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#09090b]/80 via-[#09090b]/5 to-[#09090b]/15" />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30" style={{ backgroundImage: spotlight, opacity: springOpacity }} />

        {feature && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col justify-end gap-6 p-5 sm:p-8 md:flex-row md:items-end md:justify-between md:p-10 lg:p-14">
            <div className="max-w-3xl">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[.28em] text-[#F0D98C] sm:text-[10px] sm:tracking-[.35em]">Edition 01 / Archival <span className="mx-2 text-white/35">·</span> {status.label}</p>
              <p className="mb-2 max-w-xl text-[10px] uppercase tracking-[.2em] text-white/60 sm:text-xs">{snk.tagline}</p>
              <h3 className="break-words font-display text-[clamp(2.4rem,8vw,7.5rem)] font-bold uppercase leading-[.86] tracking-[-.07em] text-white">{snk.name}</h3>
              <p className="mt-4 hidden max-w-xl text-sm leading-6 text-white/55 md:block">{snk.description}</p>
            </div>
            <div className="flex shrink-0 items-end justify-between gap-8 md:flex-col md:items-end md:gap-5">
              <p className="font-display text-xl font-semibold text-[#F0D98C] sm:text-2xl">{price}</p>
              <span className="inline-flex min-h-11 items-center gap-3 border-b border-white/55 pb-2 text-[9px] font-bold uppercase tracking-[.2em] text-white transition-colors group-hover:border-[#F0D98C] group-hover:text-[#F0D98C]">Explore release<ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
            </div>
          </div>
        )}

        {!feature && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 p-4 sm:p-6">
            <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[.2em] text-white/65"><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</div>
            <p className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#F0D98C]">{displayIndex} / {snk.availability_status.replace("_", " ")}</p>
          </div>
        )}
      </div>

      {!feature && (
        <div className={`relative ${wide ? "mt-6 md:mt-0" : "mt-5 sm:mt-7"}`}>
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
