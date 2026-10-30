"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Fingerprint, LoaderCircle } from "lucide-react";
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
    <main className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-[#0A0A0A] px-4 py-8 text-white sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(211,174,55,.12),transparent_46%),radial-gradient(ellipse_at_50%_100%,rgba(240,217,140,.035),transparent_55%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <motion.section
        initial={{ opacity: 0, y: 20, scale: .99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .72, ease: [.22, 1, .36, 1] }}
        className="relative mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-[0_36px_120px_rgba(0,0,0,.56),0_0_90px_rgba(211,174,55,.055)] backdrop-blur-xl md:p-12"
      >
        <div aria-hidden="true" className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#D3AE37]/70 to-transparent" />

        <header className="flex flex-col items-center text-center">
          <div className="relative grid h-[68px] w-[68px] place-items-center rounded-full border border-[#D3AE37]/70 bg-[#D3AE37]/[.06] shadow-[0_0_42px_rgba(211,174,55,.15),inset_0_0_22px_rgba(211,174,55,.07)] sm:h-[76px] sm:w-[76px]">
            <span className="font-display text-[26px] font-bold tracking-[-.12em] text-[#F0D98C]">SD</span>
            <span aria-hidden="true" className="absolute -inset-2 rounded-full border border-[#F0D98C]/10" />
          </div>

          <p className="mt-6 max-w-[260px] text-[8px] font-semibold uppercase leading-5 tracking-[.22em] text-[#F0D98C] sm:max-w-none sm:text-[9px] sm:tracking-[.27em]">
            <span>Restricted Atelier</span><span className="mx-2 hidden text-white/25 sm:inline">•</span><span className="block text-white/55 sm:inline">Private Control Room</span>
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,6.5vw,2.85rem)] font-bold uppercase leading-[.92] tracking-[-.065em]">
            Enter the <span className="text-white/30">Atelier</span>
          </h1>
          <p className="mt-3 max-w-xs text-xs leading-5 text-white/40">A private space for release curation and collector access.</p>
        </header>

        <div aria-hidden="true" className="my-7 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:my-8" />

        <form onSubmit={submit}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-[8px] font-medium uppercase tracking-[.2em] text-white/35 sm:text-[9px]">Administrator authentication</span>
            <Fingerprint size={15} aria-hidden="true" className="shrink-0 text-[#F0D98C]/55" />
          </div>

          <label htmlFor="admin-password" className="mb-2 block text-[9px] font-medium uppercase tracking-[.2em] text-white/55">Session password</label>
          <div className="group relative rounded-sm border border-white/10 bg-black/35 transition-[border-color,box-shadow] duration-300 focus-within:border-[#F0D98C]/80 focus-within:shadow-[0_0_0_1px_rgba(240,217,140,.22),0_0_34px_rgba(211,174,55,.12)]">
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
              className="min-h-14 w-full bg-transparent py-3 pl-4 pr-12 text-sm tracking-[.08em] text-white outline-none placeholder:text-white/25 placeholder:transition-colors placeholder:duration-300 focus:placeholder:text-white/10"
            />
            <Fingerprint aria-hidden="true" size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-300 group-focus-within:text-[#F0D98C]/75" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-[#F0D98C] transition-transform duration-500 group-focus-within:scale-x-100" />
          </div>

          <p id="admin-login-error" role="alert" aria-live="polite" className="mt-2 min-h-5 text-xs leading-5 text-red-200/90">{error}</p>

          <motion.button
            type="submit"
            data-audio-cue
            disabled={loading || !password.trim()}
            whileHover={!loading && password.trim() ? { scale: 1.015 } : undefined}
            whileTap={!loading && password.trim() ? { scale: .985 } : undefined}
            transition={{ type: "spring", stiffness: 360, damping: 24, mass: .45 }}
            className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-sm bg-[#F0D98C] px-5 text-[9px] font-bold uppercase tracking-[.2em] text-[#09090b] shadow-[0_8px_32px_rgba(211,174,55,.13)] transition-[background-color,box-shadow] duration-300 hover:bg-[#D3AE37] hover:shadow-[0_10px_42px_rgba(211,174,55,.23)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F0D98C] active:bg-[#D3AE37] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? <><LoaderCircle size={15} className="animate-spin" />Verifying credentials</> : <>Open private room <ArrowUpRight size={15} /></>}
          </motion.button>
        </form>

        <footer className="mt-6 flex items-center justify-center gap-2 text-[8px] uppercase tracking-[.16em] text-white/25">
          <span className="h-1 w-1 rounded-full bg-[#D3AE37]/70" />Encrypted session <span className="text-white/10">/</span> SneakerDrop
        </footer>
      </motion.section>
    </main>
  );
}
