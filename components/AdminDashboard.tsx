"use client";

import { useEffect, useState } from "react";
import { Edit3, LoaderCircle, LogOut, Plus, Trash2, Users, Package } from "lucide-react";
import type { AvailabilityStatus, Sneaker, SneakerCreateInput, WaitlistSubmission } from "@/types";
import { createSneaker, deleteSneaker, getSneakers, updateSneaker } from "@/actions/sneaker-actions";
import { getWaitlistSubmissions } from "@/actions/waitlist-actions";
import { logoutAdmin } from "@/actions/admin-auth-actions";

const emptyForm: SneakerCreateInput = {
  name: "", tagline: "", price: 0, image_url: "", description: "", availability_status: "coming_soon",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<"inventory" | "waitlist">("inventory");
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [form, setForm] = useState<SneakerCreateInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const refreshSneakers = async () => {
    const result = await getSneakers();
    if (result.success) setSneakers(result.data ?? []);
    else setMessage(result.error ?? "Could not load sneakers.");
  };

  const refreshWaitlist = async () => {
    const result = await getWaitlistSubmissions();
    if (result.success) setSubmissions(result.data ?? []);
    else setMessage(result.error ?? "Could not load waitlist submissions.");
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([refreshSneakers(), refreshWaitlist()]);
      setLoading(false);
    };
    void load();
  }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); setMessage(""); };
  const openEdit = (sneaker: Sneaker) => {
    setEditingId(sneaker.id);
    setForm({ name: sneaker.name, tagline: sneaker.tagline, price: sneaker.price, image_url: sneaker.image_url, description: sneaker.description, availability_status: sneaker.availability_status });
    setShowForm(true); setMessage("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const result = editingId ? await updateSneaker(editingId, form) : await createSneaker(form);
    setSaving(false);
    if (result.success) { setShowForm(false); setForm(emptyForm); setEditingId(null); await refreshSneakers(); }
    else setMessage(result.error ?? "The sneaker could not be saved.");
  };

  const remove = async (sneaker: Sneaker) => {
    if (!window.confirm(`Delete “${sneaker.name}”? This action cannot be undone.`)) return;
    setLoading(true); const result = await deleteSneaker(sneaker.id); setLoading(false);
    if (result.success) await refreshSneakers(); else setMessage(result.error ?? "The sneaker could not be deleted.");
  };

  const signOut = async () => { await logoutAdmin(); window.location.href = "/admin"; };
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen px-5 py-8 md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div><p className="text-[9px] uppercase tracking-[.32em] text-[#F0D98C]">SneakerDrop control</p><h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-[-.04em] text-white">Admin dashboard</h1></div>
          <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-[9px] font-bold uppercase tracking-[.16em] text-white/55 hover:border-[#F0D98C]/40 hover:text-white"><LogOut size={14} /><span className="hidden sm:inline">Sign out</span></button>
        </header>

        <div className="mt-6 flex gap-2 border-b border-white/10">
          <button onClick={() => { setTab("inventory"); setMessage(""); }} className={`flex items-center gap-2 border-b px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] ${tab === "inventory" ? "border-[#F0D98C] text-[#F0D98C]" : "border-transparent text-white/40"}`}><Package size={15} />Inventory</button>
          <button onClick={() => { setTab("waitlist"); void refreshWaitlist(); setMessage(""); }} className={`flex items-center gap-2 border-b px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] ${tab === "waitlist" ? "border-[#F0D98C] text-[#F0D98C]" : "border-transparent text-white/40"}`}><Users size={15} />Waitlist <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/60">{submissions.length}</span></button>
        </div>

        {message && <div role="alert" className="mt-5 border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-200">{message}</div>}

        {tab === "inventory" ? (
          <section className="mt-6">
            <div className="mb-5 flex justify-end"><button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-[#F0D98C] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#09090b] hover:bg-[#D3AE37]"><Plus size={15} />Add sneaker</button></div>
            {loading ? <div className="grid place-items-center border border-white/10 py-20"><LoaderCircle className="animate-spin text-[#F0D98C]" /></div> : (
              <div className="overflow-x-auto border border-white/10">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-[.18em] text-white/35"><th className="px-5 py-4">Sneaker</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Created</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
                  <tbody>{sneakers.map((sneaker) => <tr key={sneaker.id} className="border-b border-white/[.06] transition hover:bg-white/[.025]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-14 w-14 overflow-hidden border border-white/10 bg-[#18181b]"><img src={sneaker.image_url} alt="" className="h-full w-full object-cover" /></div><div><p className="font-display text-sm font-bold uppercase text-white">{sneaker.name}</p><p className="mt-1 max-w-xs truncate text-xs text-white/35">{sneaker.tagline}</p></div></div></td><td className="px-5 py-4"><span className="rounded-full border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[.12em] text-white/60">{sneaker.availability_status.replace("_", " ")}</span></td><td className="px-5 py-4 text-sm text-[#F0D98C]">{currency.format(sneaker.price)}</td><td className="px-5 py-4 text-xs text-white/40">{new Date(sneaker.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button aria-label={`Edit ${sneaker.name}`} onClick={() => openEdit(sneaker)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/55 hover:border-[#F0D98C]/40 hover:text-[#F0D98C]"><Edit3 size={14} /></button><button aria-label={`Delete ${sneaker.name}`} onClick={() => void remove(sneaker)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/55 hover:border-red-400/40 hover:text-red-300"><Trash2 size={14} /></button></div></td></tr>)}</tbody>
                </table>
                {sneakers.length === 0 && <p className="p-10 text-center text-sm text-white/35">No sneakers have been added.</p>}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-6 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="border-b border-white/10 text-[9px] uppercase tracking-[.18em] text-white/35"><th className="px-5 py-4">Email</th><th className="px-5 py-4">Sneaker</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th></tr></thead>
              <tbody>{submissions.map((entry) => <tr key={entry.id} className="border-b border-white/[.06] hover:bg-white/[.025]"><td className="px-5 py-4 text-sm text-white">{entry.email}</td><td className="px-5 py-4"><p className="font-display text-sm font-bold uppercase text-white">{entry.sneaker?.name ?? "Unknown sneaker"}</p></td><td className="px-5 py-4 text-[9px] uppercase tracking-[.12em] text-white/50">{entry.sneaker?.availability_status.replace("_", " ") ?? "Removed"}</td><td className="px-5 py-4 text-xs text-white/40">{new Date(entry.created_at).toLocaleString()}</td></tr>)}</tbody>
            </table>
            {submissions.length === 0 && <p className="p-10 text-center text-sm text-white/35">No waitlist submissions yet.</p>}
          </section>
        )}

        {showForm && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-xl" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-white/10 bg-[#121214] p-6 shadow-[0_30px_100px_rgba(0,0,0,.6)] md:p-8">
            <div className="mb-7 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[.3em] text-[#F0D98C]">Catalogue record</p><h2 className="mt-2 font-display text-3xl font-bold uppercase text-white">{editingId ? "Edit sneaker" : "Add sneaker"}</h2></div><button type="button" onClick={() => setShowForm(false)} className="text-xl text-white/40 hover:text-white">×</button></div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Tagline"><input required value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
              <Field label="Price"><input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
              <Field label="Availability"><select value={form.availability_status} onChange={(e) => setForm({ ...form, availability_status: e.target.value as AvailabilityStatus })}><option value="coming_soon">Limited Drop</option><option value="available">In Stock</option><option value="sold_out">Sold Out</option></select></Field>
              <div className="md:col-span-2"><Field label="Image URL"><input required type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field></div>
              <div className="md:col-span-2"><Field label="Description"><textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div>
            </div>
            <button disabled={saving} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#F0D98C] py-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#09090b] disabled:opacity-40">{saving ? <><LoaderCircle size={15} className="animate-spin" />Saving</> : editingId ? "Save changes" : "Create sneaker"}</button>
          </form>
        </div>}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[9px] uppercase tracking-[.18em] text-white/45">{label}<div className="mt-2 [&>input]:w-full [&>input]:border [&>input]:border-white/10 [&>input]:bg-black/20 [&>input]:px-4 [&>input]:py-3 [&>input]:text-sm [&>input]:normal-case [&>input]:tracking-normal [&>input]:text-white [&>input]:outline-none [&>input]:focus:border-[#F0D98C]/55 [&>select]:w-full [&>select]:border [&>select]:border-white/10 [&>select]:bg-[#121214] [&>select]:px-4 [&>select]:py-3 [&>select]:text-sm [&>select]:normal-case [&>select]:tracking-normal [&>select]:text-white [&>select]:outline-none [&>select]:focus:border-[#F0D98C]/55 [&>textarea]:w-full [&>textarea]:resize-y [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-black/20 [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-sm [&>textarea]:normal-case [&>textarea]:tracking-normal [&>textarea]:text-white [&>textarea]:outline-none [&>textarea]:focus:border-[#F0D98C]/55">{children}</div></label>;
}
