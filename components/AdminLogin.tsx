"use client";

import { useState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";
import { loginAdmin } from "@/actions/admin-auth-actions";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError("");
    const result = await loginAdmin(password);
    setLoading(false);
    if (result.success) window.location.reload();
    else setError(result.message);
  };

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-md border border-white/10 bg-[#121214] p-7 shadow-[0_30px_100px_rgba(0,0,0,.45)] md:p-10">
        <div className="mb-8 grid h-12 w-12 place-items-center rounded-full border border-[#F0D98C]/30 bg-[#F0D98C]/10 text-[#F0D98C]"><LockKeyhole size={20} /></div>
        <p className="text-[9px] uppercase tracking-[.32em] text-[#F0D98C]">Restricted area</p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-[-.05em] text-white">Admin access</h1>
        <label htmlFor="admin-password" className="mt-8 mb-2 block text-[9px] uppercase tracking-[.22em] text-white/45">Session password</label>
        <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition focus:border-[#F0D98C]/55" />
        {error && <p role="alert" className="mt-3 text-xs text-red-300/80">{error}</p>}
        <button disabled={loading || !password.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#F0D98C] py-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#09090b] disabled:opacity-40">{loading ? <><LoaderCircle size={15} className="animate-spin" />Authenticating</> : "Open dashboard"}</button>
      </form>
    </main>
  );
}
