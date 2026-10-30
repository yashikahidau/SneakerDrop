"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Fingerprint, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { loginAdmin } from "@/actions/admin-auth-actions";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const result = await loginAdmin(password);
      if (result.success) {
        router.replace("/admin");
        router.refresh();
      } else setError(result.message);
    } catch {
      setError("The private session could not be opened. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-[#09090b] px-4 py-12 text-white sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(211,174,55,.12),transparent_48%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[length:auto,72px_72px,72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, ease: [.22, 1, .36, 1] }} className="relative w-full max-w-[560px]">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <div className="relative grid h-[76px] w-[76px] place-items-center rounded-full border border-[#D3AE37]/70 bg-[#D3AE37]/[.06] shadow-[0_0_55px_rgba(211,174,55,.12),inset_0_0_25px_rgba(211,174,55,.06)] sm:h-[88px] sm:w-[88px]">
            <span className="font-display text-[27px] font-bold tracking-[-.12em] text-[#F0D98C] sm:text-[31px]">SD</span>
            <span aria-hidden="true" className="absolute -inset-2 rounded-full border border-[#F0D98C]/10" />
          </div>
          <p className="mt-7 text-[8px] font-semibold uppercase tracking-[.2em] text-[#F0D98C] sm:text-[9px] sm:tracking-[.32em]">Restricted Atelier <span className="mx-1 text-white/20">•</span> Private Control Room</p>
          <h1 className="mt-4 font-display text-[clamp(2.3rem,8vw,4.7rem)] font-bold uppercase leading-[.88] tracking-[-.065em]">Enter the<br /><span className="text-white/25">Atelier</span></h1>
          <p className="mt-4 max-w-sm text-xs leading-6 text-white/40">A private space for curating releases and collector access.</p>
        </div>

        <form onSubmit={submit} className="relative border border-white/10 bg-white/[.025] p-5 shadow-[0_32px_100px_rgba(0,0,0,.48)] backdrop-blur-xl sm:p-8">
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#D3AE37]/70 to-transparent" />
          <div className="mb-6 flex items-center justify-between border-b border-white/[.08] pb-4"><span className="text-[8px] uppercase tracking-[.24em] text-white/35">Administrator authentication</span><Fingerprint size={15} className="text-[#F0D98C]/60" /></div>
          <label htmlFor="admin-password" className="mb-2 block text-[9px] font-medium uppercase tracking-[.2em] text-white/55">Session password</label>
          <div className="group relative rounded-sm border border-white/10 bg-black/35 transition-[border-color,box-shadow] duration-300 focus-within:border-[#F0D98C]/75 focus-within:shadow-[0_0_0_1px_rgba(240,217,140,.2),0_0_32px_rgba(211,174,55,.11)]">
            <input id="admin-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete="current-password" required aria-invalid={Boolean(error)} aria-describedby={error ? "admin-login-error" : undefined} className="min-h-14 w-full bg-transparent px-4 text-sm tracking-[.08em] text-white outline-none placeholder:text-white/20" placeholder="Enter private key" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-[#F0D98C] transition-transform duration-500 group-focus-within:scale-x-100" />
          </div>
          {error && <p id="admin-login-error" role="alert" className="mt-3 text-xs text-red-200/90">{error}</p>}
          <motion.button type="submit" data-audio-cue disabled={loading || !password.trim()} whileHover={!loading && password.trim() ? { y: -1 } : undefined} whileTap={!loading && password.trim() ? { scale: .99 } : undefined} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[#F0D98C] px-5 text-[9px] font-bold uppercase tracking-[.2em] text-[#09090b] shadow-[0_8px_32px_rgba(211,174,55,.12)] transition-[background-color,box-shadow] hover:bg-[#D3AE37] hover:shadow-[0_10px_40px_rgba(211,174,55,.2)] disabled:cursor-not-allowed disabled:opacity-45">{loading ? <><LoaderCircle size={15} className="animate-spin" />Verifying credentials</> : <>Open private room <ArrowUpRight size={15} /></>}</motion.button>
          <p className="mt-5 text-center text-[8px] uppercase tracking-[.16em] text-white/25">Encrypted session <span className="mx-2 text-[#D3AE37]/60">/</span> Access recorded locally</p>
        </form>
        <p className="mt-7 text-center text-[8px] uppercase tracking-[.22em] text-white/25">SneakerDrop <span className="mx-2 text-white/10">—</span> Rare by design</p>
      </motion.div>
    </main>
  );
}
