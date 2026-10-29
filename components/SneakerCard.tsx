"use client";
import{motion}from"framer-motion";import{ArrowUpRight}from"lucide-react";import type{Sneaker}from"@/types";
interface Props{snk: Sneaker;index:number;onJoin:(sneaker:Sneaker)=>void}
const meta={available:{label:"In Stock",dot:"bg-emerald-400"},coming_soon:{label:"Limited Drop",dot:"bg-[#F0D98C]"},sold_out:{label:"Sold Out",dot:"bg-white/35"}};
export default function SneakerCard({ snk, index, onJoin }: Props) {
  const status = meta[snk.availability_status] ?? meta.coming_soon;
  const soldOut = snk.availability_status === "sold_out";
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(snk.price);

  return (
    <motion.article data-cursor="active" className={`sneaker-card group relative min-w-0 overflow-hidden rounded-[2px] border border-white/[.08] bg-[#121214] transition-colors duration-500 hover:border-[#D3AE37]/40 ${index === 0 ? "md:col-span-2" : ""}`} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.75, delay: (index % 3) * 0.09, ease: [0.22, 1, 0.36, 1] }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#27272a_0%,#121214_68%)]">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/75 backdrop-blur-xl sm:left-5 sm:top-5"><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={snk.image_url} alt={`${snk.name} — ${snk.tagline}`} loading={index < 3 ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.055]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/55 via-transparent to-transparent" />
      </div>
      <div className="flex min-h-[210px] flex-col justify-between gap-5 p-4 sm:p-5 md:p-7">
        <div className="min-w-0">
          <p className="mb-2 truncate text-[9px] uppercase tracking-[.25em] text-[#F0D98C]/65">{snk.tagline}</p>
          <h3 className="break-words font-display text-2xl font-bold uppercase leading-none tracking-[-.04em] text-white md:text-3xl">{snk.name}</h3>
          <p className="mt-4 max-w-md line-clamp-2 text-xs leading-6 text-white/42">{snk.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-lg font-bold text-[#F0D98C]">{currency}</p>
          <button disabled={soldOut} onClick={() => onJoin(snk)} className="group/button inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 text-[9px] font-bold uppercase tracking-[.1em] text-white/80 transition-all hover:border-[#F0D98C]/40 hover:bg-[#F0D98C] hover:text-[#09090b] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-35 sm:gap-3 sm:px-4 sm:tracking-[.13em]"><span>{soldOut ? "Archived" : snk.availability_status === "available" ? "Secure Access" : "Join Waitlist"}</span><ArrowUpRight size={14} className="shrink-0 transition-transform group-hover/button:translate-x-1" /></button>
        </div>
      </div>
    </motion.article>
  );
}
