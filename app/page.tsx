import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import SneakerCatalogue from "@/components/SneakerCatalogue";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Marquee />
        <SneakerCatalogue />
        <section id="journal" aria-labelledby="journal-title" className="relative isolate overflow-hidden border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_45%,rgba(211,174,55,.07),transparent_48%),linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[length:auto,72px_72px,72px_72px]" />
          <div className="mx-auto grid max-w-[1600px] gap-8 md:grid-cols-[4.5rem_minmax(0,.9fr)_minmax(0,1.1fr)] md:gap-12 lg:gap-20">
            <div className="flex items-start gap-4 border-b border-white/10 pb-4 md:flex-col md:items-center md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <span className="font-display text-sm font-bold tracking-[.1em] text-[#F0D98C]">01</span>
              <span className="text-[9px] uppercase tracking-[.25em] text-white/35 md:[writing-mode:vertical-rl] md:rotate-180">Field notes · 2026</span>
              <span aria-hidden="true" className="ml-auto h-px w-10 bg-[#D3AE37]/50 md:ml-0 md:mt-4 md:h-16 md:w-px" />
            </div>
            <div className="relative">
              <p className="mb-4 text-[9px] uppercase tracking-[.32em] text-[#F0D98C]">Journal / Objects in motion</p>
              <h2 id="journal-title" className="max-w-md font-display text-3xl font-semibold uppercase leading-[.95] tracking-[-.05em] text-white sm:text-4xl lg:text-5xl">The lasting pair is made in the details.</h2>
            </div>
            <div className="flex flex-col justify-between gap-7 border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:pl-12">
              <p className="max-w-2xl text-sm leading-7 text-white/50 md:text-base md:leading-8">A silhouette earns its place through proportion, material, and the marks it gathers over time. Looking beyond release day reveals the design decisions that keep a pair in rotation and in memory.</p>
              <div className="flex items-center gap-4 text-[9px] uppercase tracking-[.22em] text-white/35"><span className="h-px w-10 bg-[#D3AE37]/55" />An ongoing study of sneaker culture</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
