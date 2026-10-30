"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Fingerprint, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { loginAdmin } from "@/actions/admin-auth-actions";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await loginAdmin(password);
      if (result.success) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("The private session could not be opened. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-[#0A0A0A] px-5 py-10 text-white sm:px-8 lg:px-12 xl:px-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_44%,rgba(211,174,55,.105),transparent_43%),radial-gradient(ellipse_at_50%_100%,rgba(240,217,140,.035),transparent_52%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .78, ease: [.22, 1, .36, 1] }}
        className="relative mx-auto w-full max-w-[1440px]"
      >
        <header className="relative flex flex-col items-center gap-4 border-b border-white/10 pb-7 text-center sm:flex-row sm:justify-center sm:pb-8 lg:justify-start">
          <motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .12, duration: .6, ease: [.22, 1, .36, 1] }} className="relative grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full border border-[#D3AE37]/70 bg-[#D3AE37]/[.04] shadow-[0_0_38px_rgba(211,174,55,.13),inset_0_0_20px_rgba(211,174,55,.06)]">
            <span className="font-display text-[22px] font-bold tracking-[-.12em] text-[#F0D98C]">SD</span>
            <span aria-hidden="true" className="absolute -inset-1.5 rounded-full border border-[#F0D98C]/10" />
          </motion.div>
          <span aria-hidden="true" className="hidden h-9 w-px bg-white/10 sm:block" />
          <p className="max-w-[270px] text-[8px] font-semibold uppercase leading-5 tracking-[.22em] text-[#F0D98C] sm:max-w-none sm:text-left sm:text-[9px] sm:tracking-[.28em]">
            Restricted Atelier <span className="mx-1 text-white/25">•</span><span className="text-white/50">Private Control Room</span>
          </p>
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-transparent via-[#F0D98C]/45 to-transparent" initial={{ scaleX: 0, opacity: .2 }} animate={{ scaleX: [0, 1, 1], opacity: [.2, .65, .25] }} transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.8 }} />
        </header>

        <div className="grid items-center gap-10 py-9 sm:py-12 lg:grid-cols-[1.12fr_.88fr] lg:gap-14 lg:py-16 xl:gap-24 xl:py-20">
          <div className="text-center lg:text-left">
            <p className="mb-5 text-[8px] uppercase tracking-[.3em] text-white/35 sm:text-[9px]">Access / 01 — Atelier credentials</p>
            <h1 className="font-display font-bold uppercase leading-[.8] tracking-[-.075em]">
              <span className="block text-[clamp(2.8rem,8vw,7.5rem)] text-white">Enter the</span>
              <span className="text-outline mt-2 block text-[clamp(4.5rem,15vw,12.5rem)] opacity-55">Atelier</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-[13px] leading-6 text-white/45 sm:text-sm sm:leading-7 lg:mx-0">A private space for release curation and collector access.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:mx-0 lg:border-l lg:border-white/10 lg:py-4 lg:pl-10 xl:pl-14">
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-[8px] font-medium uppercase tracking-[.22em] text-white/35 sm:text-[9px]">Administrator authentication</span>
              <Fingerprint size={16} aria-hidden="true" className="shrink-0 text-[#F0D98C]/55" />
            </div>

            <form onSubmit={submit}>
              <label htmlFor="admin-password" className="mb-2 block text-[9px] font-medium uppercase tracking-[.2em] text-white/50">Session password</label>
              <div className="group relative border-b border-white/20 transition-colors duration-200 ease-out focus-within:border-[#F0D98C] focus-within:shadow-[0_1px_0_rgba(240,217,140,.65),0_7px_22px_-12px_rgba(211,174,55,.65)]">
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(""); }}
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby="admin-login-error"
                  placeholder="Enter private key"
                  className="min-h-14 w-full bg-transparent py-3 pl-0 pr-10 text-sm tracking-[.08em] text-white outline-none placeholder:text-white/30 placeholder:transition-colors placeholder:duration-200 focus:placeholder:text-white/10 focus-visible:outline-none"
                />
                <Fingerprint aria-hidden="true" size={16} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-200 ease-out group-focus-within:text-[#F0D98C]/75" />
              </div>

              <p id="admin-login-error" role="alert" aria-live="polite" className="mt-2 min-h-5 text-xs leading-5 text-red-200/90">{error}</p>

              <motion.button
                type="submit"
                data-audio-cue
                disabled={loading || !password.trim()}
                whileHover={!loading && password.trim() ? { scale: 1.015 } : undefined}
                whileTap={!loading && password.trim() ? { scale: .985 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 26, mass: .38 }}
                className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[#F0D98C] px-5 text-[9px] font-bold uppercase tracking-[.2em] text-[#09090b] shadow-[0_8px_30px_rgba(211,174,55,.12)] transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[#D3AE37] hover:shadow-[0_10px_38px_rgba(211,174,55,.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F0D98C] active:bg-[#D3AE37] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loading ? <><LoaderCircle size={15} className="animate-spin" />Verifying credentials</> : <>Open private room <ArrowUpRight size={15} /></>}
              </motion.button>
            </form>

            <p className="mt-6 flex items-center justify-center gap-2 text-[8px] uppercase tracking-[.16em] text-white/25 lg:justify-start">
              <span className="h-1 w-1 rounded-full bg-[#D3AE37]/70" />Encrypted session <span className="text-white/10">/</span> SneakerDrop
            </p>
          </div>
        </div>

        <footer className="flex justify-center border-t border-white/10 pt-5 sm:pt-6 lg:justify-start">
          <Link href="/" data-audio-cue className="inline-flex min-h-10 items-center gap-2 text-[8px] font-medium uppercase tracking-[.16em] text-white/40 transition-colors duration-200 ease-out hover:text-[#F0D98C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0D98C]">
            <ArrowLeft aria-hidden="true" size={13} />Return to public showcase
          </Link>
        </footer>
      </motion.section>
    </main>
  );
}
