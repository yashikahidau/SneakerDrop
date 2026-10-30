"use client";

/* eslint-disable @next/next/no-img-element -- Product images use arbitrary external URLs without a configured image host allowlist. */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, Check, Edit3, LoaderCircle, LogOut, Package, Plus, Search, Trash2, Users, X } from "lucide-react";
import type { AvailabilityStatus, Sneaker, SneakerCreateInput, WaitlistSubmission } from "@/types";
import { createSneaker, deleteSneaker, getAdminSneakers, updateSneaker } from "@/actions/sneaker-actions";
import { getWaitlistSubmissions } from "@/actions/waitlist-actions";
import { logoutAdmin } from "@/actions/admin-auth-actions";
import ModalPortal from "@/components/ModalPortal";

type SneakerFormState = Omit<SneakerCreateInput, "price"> & { price: string };

const emptyForm: SneakerFormState = {
  name: "", tagline: "", category: "Footwear", price: "", image_url: "", description: "",
  material_notes: "", construction_notes: "", availability_status: "coming_soon",
};

const statusOptions: { value: AvailabilityStatus; label: string; dot: string }[] = [
  { value: "available", label: "In stock", dot: "bg-emerald-400" },
  { value: "coming_soon", label: "Limited drop", dot: "bg-[#F0D98C]" },
  { value: "sold_out", label: "Sold out", dot: "bg-white/40" },
  { value: "archived", label: "Archived", dot: "bg-white/20" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" });

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"inventory" | "waitlist">("inventory");
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [form, setForm] = useState<SneakerFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sneaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const refreshSneakers = useCallback(async () => {
    const result = await getAdminSneakers();
    if (result.success) setSneakers(result.data ?? []);
    else setMessage(result.error ?? "Could not load the catalogue.");
  }, []);

  const refreshWaitlist = useCallback(async () => {
    const result = await getWaitlistSubmissions();
    if (result.success) setSubmissions(result.data ?? []);
    else setMessage(result.error ?? "Could not load waitlist submissions.");
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([getAdminSneakers(), getWaitlistSubmissions()]).then(([inventory, waitlist]) => {
      if (!active) return;
      if (inventory.success) setSneakers(inventory.data ?? []);
      else setMessage(inventory.error ?? "Could not load the catalogue.");
      if (waitlist.success) setSubmissions(waitlist.data ?? []);
      else if (!inventory.success) setMessage(waitlist.error ?? "Could not load waitlist submissions.");
      setLoading(false);
    }).catch(() => {
      if (active) { setMessage("The dashboard could not connect to the database."); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  const visibleSneakers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return sneakers;
    return sneakers.filter((sneaker) => [sneaker.name, sneaker.tagline, sneaker.category].some((value) => value.toLocaleLowerCase().includes(query)));
  }, [search, sneakers]);

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setEditorOpen(true); setMessage(""); };
  const openEdit = (sneaker: Sneaker) => {
    setEditingId(sneaker.id);
    setForm({ name: sneaker.name, tagline: sneaker.tagline, category: sneaker.category, price: String(sneaker.price), image_url: sneaker.image_url, description: sneaker.description, material_notes: sneaker.material_notes ?? "", construction_notes: sneaker.construction_notes ?? "", availability_status: sneaker.availability_status });
    setEditorOpen(true);
    setMessage("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(form.price);
    if (!form.price.trim() || !Number.isFinite(price) || price < 0) {
      setMessage("Enter a valid non-negative price.");
      return;
    }
    setSaving(true); setMessage(""); setNotice("");
    try {
      const payload: SneakerCreateInput = { ...form, price };
      const result = editingId ? await updateSneaker(editingId, payload) : await createSneaker(payload);
      if (!result.success) { setMessage(result.error ?? "The sneaker could not be saved."); return; }
      setNotice(result.warning ?? (editingId ? "Release updated." : "Release added to the catalogue."));
      setEditorOpen(false); setForm({ ...emptyForm }); setEditingId(null);
      await refreshSneakers();
    } catch {
      setMessage("The save could not be completed. Check the connection and try again.");
    } finally { setSaving(false); }
  };

  const changeStatus = async (sneaker: Sneaker, next: AvailabilityStatus) => {
    if (next === sneaker.availability_status) return;
    setBusyStatus(sneaker.id); setMessage(""); setNotice("");
    const previous = sneakers;
    setSneakers((current) => current.map((item) => item.id === sneaker.id ? { ...item, availability_status: next } : item));
    try {
      const result = await updateSneaker(sneaker.id, { availability_status: next });
      if (!result.success) { setSneakers(previous); setMessage(result.error ?? "Availability could not be updated."); }
      else setNotice(`${sneaker.name} marked ${statusOptions.find((option) => option.value === next)?.label.toLowerCase()}.`);
    } catch {
      setSneakers(previous); setMessage("Availability could not be updated. Check the connection and try again.");
    } finally { setBusyStatus(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); setMessage(""); setNotice("");
    try {
      const result = await deleteSneaker(deleteTarget.id);
      if (!result.success) { setMessage(result.error ?? "The release could not be deleted."); return; }
      setSneakers((current) => current.filter((item) => item.id !== deleteTarget.id));
      setNotice(`${deleteTarget.name} removed. Its waitlist entries were removed with it.`);
      setDeleteTarget(null);
      await refreshWaitlist();
    } catch { setMessage("The release could not be deleted. Check the connection and try again."); }
    finally { setDeleting(false); }
  };

  const signOut = async () => {
    await logoutAdmin();
    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0A] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-56 -top-64 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(211,174,55,.08),transparent_68%)]" />
      <div className="relative mx-auto max-w-[1600px]">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }} className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6 sm:pb-8">
          <div><p className="text-[9px] font-semibold uppercase tracking-[.34em] text-[#F0D98C]">SneakerDrop / Control room</p><h1 className="mt-3 font-display text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[.9] tracking-[-.06em]">Admin <span className="text-white/25">atelier</span></h1><p className="mt-3 text-xs text-white/40">Release inventory · access requests · live catalogue control</p></div>
          <button type="button" onClick={() => void signOut()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-4 text-[9px] font-bold uppercase tracking-[.16em] text-white/60 transition hover:border-[#F0D98C]/45 hover:text-[#F0D98C] active:scale-[.98]"><LogOut size={14} />Sign out</button>
        </motion.header>

        <section aria-label="Dashboard summary" className="mt-6 grid gap-3 sm:grid-cols-3">
          <Summary label="Catalogue releases" value={sneakers.length} icon={<Package size={16} />} />
          <Summary label="Live availability" value={sneakers.filter((item) => item.availability_status === "available").length} icon={<Check size={16} />} />
          <Summary label="Waitlist requests" value={submissions.length} icon={<Users size={16} />} />
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
          <div role="tablist" aria-label="Dashboard sections" className="flex gap-5 sm:gap-8">
            <Tab active={tab === "inventory"} onClick={() => { setTab("inventory"); setMessage(""); }} icon={<Package size={14} />}>Inventory <span className="text-white/30">{String(sneakers.length).padStart(2, "0")}</span></Tab>
            <Tab active={tab === "waitlist"} onClick={() => { setTab("waitlist"); setMessage(""); void refreshWaitlist(); }} icon={<Users size={14} />}>Waitlist <span className="text-white/30">{String(submissions.length).padStart(2, "0")}</span></Tab>
          </div>
          {tab === "inventory" && <div className="flex w-full items-center justify-between gap-3 pb-3 sm:w-auto sm:justify-end">
            <label className="flex min-h-11 min-w-0 items-center gap-2 border-b border-white/15 px-1 py-2 text-white/45 focus-within:border-[#F0D98C]/60"><Search size={14} /><input aria-label="Search releases" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search releases" className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-white/30 sm:w-40" /></label>
            <button type="button" onClick={openCreate} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#F0D98C] px-4 text-[9px] font-bold uppercase tracking-[.14em] text-[#09090b] transition hover:bg-[#D3AE37] active:scale-[.98] sm:px-5"><Plus size={15} />Add release</button>
          </div>}
        </div>

        <AnimatePresence mode="wait">
          {message ? <motion.p key="error" role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 border border-red-300/20 bg-red-300/[.05] px-4 py-3 text-xs text-red-200">{message}</motion.p> : notice ? <motion.p key="notice" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 border border-[#F0D98C]/20 bg-[#F0D98C]/[.04] px-4 py-3 text-xs text-[#F0D98C]/90">{notice}</motion.p> : null}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {tab === "inventory" ? <motion.section key="inventory" aria-label="Sneaker inventory" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }} className="mt-5 overflow-hidden rounded-sm border border-white/10 bg-white/[.025] shadow-[0_24px_80px_rgba(0,0,0,.18)] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/[.08] px-4 py-4 sm:px-6"><div><p className="text-[9px] uppercase tracking-[.26em] text-white/35">Collection management</p><h2 className="mt-1 font-display text-lg font-bold uppercase tracking-[-.03em]">Release inventory</h2></div><span className="text-[9px] uppercase tracking-[.18em] text-white/35">{visibleSneakers.length} records</span></div>
            {loading ? <LoadingState /> : visibleSneakers.length === 0 ? <EmptyState archived={sneakers.length > 0} onCreate={openCreate} /> : <>
              <div className="flex flex-col gap-4 p-4 lg:hidden">
                {visibleSneakers.map((sneaker, index) => <motion.article key={sneaker.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .035, .28) }} className="min-w-0 border border-white/10 bg-white/[.025] p-4 shadow-[0_12px_36px_rgba(0,0,0,.16)]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden border border-white/10 bg-white/[.04]"><img src={sneaker.image_url} alt="" loading="lazy" className="h-full w-full object-cover" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-display text-sm font-bold uppercase leading-tight tracking-[-.02em] text-white">{sneaker.name}</p>
                      <p className="mt-1 break-words text-[10px] leading-4 text-white/40">{sneaker.tagline}</p>
                      <span className="mt-2 inline-flex max-w-full break-words border border-white/10 bg-white/[.025] px-2 py-1 text-[8px] uppercase tracking-[.12em] text-white/55">{sneaker.category}</span>
                    </div>
                    <p className="shrink-0 self-start font-display text-sm font-semibold text-[#F0D98C]">{currency.format(sneaker.price)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-3">
                    <span className="text-[8px] uppercase tracking-[.14em] text-white/30">Availability</span>
                    <label className="inline-flex min-h-11 items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${statusOptions.find((status) => status.value === sneaker.availability_status)?.dot ?? "bg-white/30"}`} />
                      <select aria-label={`Change ${sneaker.name} availability`} value={sneaker.availability_status} disabled={busyStatus === sneaker.id} onChange={(event) => void changeStatus(sneaker, event.target.value as AvailabilityStatus)} className="min-h-11 max-w-[170px] bg-transparent text-[9px] uppercase tracking-[.1em] text-white/75 outline-none focus:text-[#F0D98C] disabled:opacity-40">{statusOptions.map((option) => <option key={option.value} value={option.value} className="bg-[#121214] text-white">{option.label}</option>)}</select>
                      {busyStatus === sneaker.id && <LoaderCircle size={12} className="animate-spin text-[#F0D98C]" />}
                    </label>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button type="button" onClick={() => openEdit(sneaker)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[.14em] text-white/70 transition-colors hover:border-[#F0D98C]/35 hover:text-[#F0D98C] active:scale-[.98]"><Edit3 size={14} />Edit</button>
                    <button type="button" onClick={() => setDeleteTarget(sneaker)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-white/10 px-3 text-[9px] font-bold uppercase tracking-[.14em] text-white/55 transition-colors hover:border-red-300/30 hover:text-red-200 active:scale-[.98]"><Trash2 size={14} />Delete</button>
                  </div>
                  <p className="mt-3 text-[8px] uppercase tracking-[.14em] text-white/25">Added {dateFormat.format(new Date(sneaker.created_at))}</p>
                </motion.article>)}
              </div>
              <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead><tr className="border-b border-white/[.08] text-[9px] uppercase tracking-[.18em] text-white/35"><th className="px-5 py-4 font-medium sm:px-6">Product</th><th className="px-4 py-4 font-medium">Category</th><th className="px-4 py-4 font-medium">Price</th><th className="px-4 py-4 font-medium">Availability</th><th className="px-4 py-4 font-medium">Added</th><th className="px-5 py-4 text-right font-medium sm:px-6">Manage</th></tr></thead>
                <tbody>{visibleSneakers.map((sneaker, index) => <motion.tr key={sneaker.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .035, .28) }} className="group border-b border-white/[.055] transition-colors duration-300 hover:bg-[#F0D98C]/[.035]">
                  <td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="h-12 w-14 shrink-0 overflow-hidden border border-white/10 bg-white/[.04]"><img src={sneaker.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" /></div><div className="min-w-0"><p className="max-w-[270px] truncate font-display text-sm font-bold uppercase tracking-[-.02em] text-white">{sneaker.name}</p><p className="mt-1 max-w-[270px] truncate text-[10px] text-white/35">{sneaker.tagline}</p></div></div></td>
                  <td className="px-4 py-4"><span className="border border-white/10 bg-white/[.025] px-2.5 py-1.5 text-[9px] uppercase tracking-[.12em] text-white/55">{sneaker.category}</span></td>
                  <td className="px-4 py-4 font-display text-sm font-semibold text-[#F0D98C]">{currency.format(sneaker.price)}</td>
                  <td className="px-4 py-4"><label className="inline-flex items-center gap-2"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusOptions.find((status) => status.value === sneaker.availability_status)?.dot ?? "bg-white/30"}`} /><select aria-label={`Change ${sneaker.name} availability`} value={sneaker.availability_status} disabled={busyStatus === sneaker.id} onChange={(event) => void changeStatus(sneaker, event.target.value as AvailabilityStatus)} className="min-h-11 max-w-[150px] bg-transparent py-2 text-[9px] uppercase tracking-[.1em] text-white/70 outline-none transition-colors hover:text-[#F0D98C] focus:text-[#F0D98C] disabled:opacity-40">{statusOptions.map((option) => <option key={option.value} value={option.value} className="bg-[#121214] text-white">{option.label}</option>)}</select>{busyStatus === sneaker.id && <LoaderCircle size={12} className="animate-spin text-[#F0D98C]" />}</label></td>
                  <td className="px-4 py-4 text-[10px] tabular-nums text-white/40">{dateFormat.format(new Date(sneaker.created_at))}</td>
                  <td className="px-5 py-4 sm:px-6"><div className="flex justify-end gap-2"><IconButton label={`Edit ${sneaker.name}`} onClick={() => openEdit(sneaker)}><Edit3 size={14} /></IconButton><IconButton label={`Delete ${sneaker.name}`} danger onClick={() => setDeleteTarget(sneaker)}><Trash2 size={14} /></IconButton></div></td>
                </motion.tr>)}</tbody>
              </table>
              </div>
            </>}
          </motion.section> : <motion.section key="waitlist" aria-label="Waitlist submissions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }} className="mt-5 overflow-hidden rounded-sm border border-white/10 bg-white/[.025] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/[.08] px-4 py-4 sm:px-6"><div><p className="text-[9px] uppercase tracking-[.26em] text-white/35">Collector access</p><h2 className="mt-1 font-display text-lg font-bold uppercase tracking-[-.03em]">Waitlist submissions</h2></div><span className="text-[9px] uppercase tracking-[.18em] text-white/35">{submissions.length} requests</span></div>
            {!loading && submissions.length > 0 && <div className="flex flex-col gap-4 p-4 lg:hidden">
              {submissions.map((entry, index) => <motion.article key={entry.id} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .025, .25) }} className="min-w-0 border border-white/10 bg-white/[.025] p-4">
                <p className="break-all text-sm font-medium leading-5 text-white/85">{entry.email}</p>
                <div className="mt-4 flex min-w-0 items-center gap-3 border-t border-white/[.07] pt-3">
                  {entry.sneaker?.image_url && <div className="h-14 w-14 shrink-0 overflow-hidden border border-white/10 bg-white/[.04]"><img src={entry.sneaker.image_url} alt="" loading="lazy" className="h-full w-full object-cover" /></div>}
                  <div className="min-w-0 flex-1"><p className="break-words font-display text-sm font-bold uppercase leading-tight text-white">{entry.sneaker?.name ?? "Release removed"}</p><p className="mt-1 text-xs text-[#F0D98C]">{entry.sneaker ? currency.format(entry.sneaker.price) : "—"}</p></div>
                  <span className="max-w-[112px] shrink-0 break-words border border-white/10 px-2 py-1.5 text-center text-[8px] uppercase leading-4 tracking-[.1em] text-white/50">{entry.sneaker?.availability_status.replace("_", " ") ?? "Removed"}</span>
                </div>
                <p className="mt-3 text-[8px] uppercase tracking-[.14em] text-white/30">Joined {dateFormat.format(new Date(entry.created_at))}</p>
              </motion.article>)}
            </div>}
            {loading ? <LoadingState /> : submissions.length === 0 ? <div className="px-6 py-16 text-center"><Users size={22} className="mx-auto text-white/20" /><p className="mt-4 font-display text-lg font-bold uppercase text-white/55">No requests yet</p><p className="mt-2 text-xs text-white/35">Waitlist signups will appear here as collectors request access.</p></div> : <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="border-b border-white/[.08] text-[9px] uppercase tracking-[.18em] text-white/35"><th className="px-5 py-4 font-medium sm:px-6">Collector email</th><th className="px-4 py-4 font-medium">Release</th><th className="px-4 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium sm:px-6">Joined</th></tr></thead><tbody>{submissions.map((entry, index) => <motion.tr key={entry.id} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .025, .25) }} className="group border-b border-white/[.055] transition-colors hover:bg-[#F0D98C]/[.035]"><td className="px-5 py-4 text-sm text-white/85 sm:px-6">{entry.email}</td><td className="px-4 py-4"><p className="font-display text-sm font-bold uppercase text-white">{entry.sneaker?.name ?? "Release removed"}</p><p className="mt-1 text-[10px] text-white/35">{entry.sneaker ? currency.format(entry.sneaker.price) : "—"}</p></td><td className="px-4 py-4 text-[9px] uppercase tracking-[.12em] text-white/50">{entry.sneaker?.availability_status.replace("_", " ") ?? "Removed"}</td><td className="px-5 py-4 text-[10px] tabular-nums text-white/40 sm:px-6">{dateFormat.format(new Date(entry.created_at))}</td></motion.tr>)}</tbody></table></div>}
          </motion.section>}
        </AnimatePresence>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-4 text-[9px] uppercase tracking-[.16em] text-white/25"><span>Private administration · server-verified access</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Session protected</span></footer>
      </div>

      <AnimatePresence>
        {editorOpen && <ModalPortal onClose={() => { if (!saving) setEditorOpen(false); }}><motion.div key="editor" className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md lg:items-stretch lg:justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditorOpen(false); }}>
          <motion.aside role="dialog" aria-modal="true" aria-labelledby="editor-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 30 }} className="mx-2 flex h-[85svh] max-h-[85vh] w-[calc(100%-1rem)] max-w-lg flex-col overflow-y-auto rounded-t-2xl border border-white/10 bg-[#101012]/95 shadow-[0_-20px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl md:mx-0 md:h-full md:max-h-full md:max-w-2xl md:overflow-hidden md:rounded-t-none md:border-l md:shadow-[-30px_0_100px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8"><div><p className="text-[9px] uppercase tracking-[.3em] text-[#F0D98C]">Product management</p><h2 id="editor-title" className="mt-2 font-display text-2xl font-bold uppercase tracking-[-.04em] sm:text-3xl">{editingId ? "Edit release" : "New release"}</h2></div><button type="button" aria-label="Close editor" onClick={() => setEditorOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/55 transition hover:border-[#F0D98C]/50 hover:text-[#F0D98C] active:scale-95"><X size={17} /></button></div>
            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Product name"><input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Aero Form 01" /></Field><Field label="Category"><input required maxLength={60} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Performance / Lifestyle" /></Field></div>
              <Field label="Editorial tagline"><input required maxLength={160} value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} placeholder="A study in motion" /></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Price (USD)"><input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></Field><Field label="Availability"><select value={form.availability_status} onChange={(event) => setForm({ ...form, availability_status: event.target.value as AvailabilityStatus })}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field></div>
              <Field label="Product image URL"><input required type="url" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} placeholder="https://…" /></Field>
              {form.image_url && <div className="aspect-[16/7] overflow-hidden border border-white/10 bg-white/[.03]"><img src={form.image_url} alt="Product preview" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.opacity = "0.2"; }} /></div>}
              <Field label="Description"><textarea required rows={4} maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Material notes (optional)"><textarea rows={3} value={form.material_notes ?? ""} onChange={(event) => setForm({ ...form, material_notes: event.target.value })} /></Field><Field label="Construction notes (optional)"><textarea rows={3} value={form.construction_notes ?? ""} onChange={(event) => setForm({ ...form, construction_notes: event.target.value })} /></Field></div>
            </div><div className="border-t border-white/10 bg-[#101012] px-5 py-4 sm:px-8"><AnimatePresence>{message && <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3 text-xs text-red-200">{message}</motion.p>}</AnimatePresence><div className="flex gap-3"><button type="button" disabled={saving} onClick={() => setEditorOpen(false)} className="min-h-12 flex-1 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-[.16em] text-white/65 transition hover:border-white/30 hover:text-white disabled:opacity-40">Cancel</button><button type="submit" disabled={saving} className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-full bg-[#F0D98C] text-[9px] font-bold uppercase tracking-[.16em] text-[#09090b] transition hover:bg-[#D3AE37] disabled:opacity-50">{saving ? <><LoaderCircle size={14} className="animate-spin" />Saving</> : <><Check size={14} />{editingId ? "Save release" : "Publish release"}</>}</button></div></div></form>
          </motion.aside>
        </motion.div></ModalPortal>}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && <ModalPortal onClose={() => { if (!deleting) setDeleteTarget(null); }}><motion.div className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}><motion.section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} className="w-full max-w-md border border-white/10 bg-[#121214] p-6 shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:p-8"><span className="grid h-11 w-11 place-items-center rounded-full border border-red-300/20 bg-red-300/[.06] text-red-200"><Archive size={18} /></span><p className="mt-6 text-[9px] uppercase tracking-[.28em] text-red-200/75">Permanent action</p><h2 id="delete-title" className="mt-2 font-display text-2xl font-bold uppercase tracking-[-.04em]">Remove release?</h2><p className="mt-3 text-sm leading-6 text-white/50"><span className="text-white">{deleteTarget.name}</span> will be removed from the catalogue. Its associated waitlist entries will also be deleted.</p>{message && <p role="alert" className="mt-4 text-xs text-red-200">{message}</p>}<div className="mt-7 flex gap-3"><button type="button" disabled={deleting} onClick={() => { setDeleteTarget(null); setMessage(""); }} className="min-h-12 flex-1 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-[.16em] text-white/65 transition hover:border-white/30">Keep release</button><button type="button" disabled={deleting} onClick={() => void confirmDelete()} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-red-300/25 bg-red-300/[.08] text-[9px] font-bold uppercase tracking-[.16em] text-red-100 transition hover:bg-red-300/[.16] disabled:opacity-50">{deleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete release</button></div></motion.section></motion.div></ModalPortal>}
      </AnimatePresence>
    </main>
  );
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <motion.article whileHover={{ y: -2 }} className="border border-white/10 bg-white/[.03] p-4 backdrop-blur-md transition-colors hover:border-[#D3AE37]/30 sm:p-5"><div className="flex items-center justify-between text-[#F0D98C]/65"><p className="text-[9px] uppercase tracking-[.2em] text-white/40">{label}</p>{icon}</div><p className="mt-3 font-display text-3xl font-bold tabular-nums tracking-[-.05em]">{String(value).padStart(2, "0")}</p></motion.article>;
}

function Tab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`relative inline-flex min-h-12 items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] transition-colors sm:gap-2.5 sm:text-[10px] ${active ? "text-[#F0D98C]" : "text-white/40 hover:text-white/75"}`}>{icon}{children}{active && <motion.span layoutId="admin-tab-underline" className="absolute inset-x-0 bottom-0 h-px bg-[#F0D98C]" />}</button>;
}

function IconButton({ label, danger = false, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <motion.button type="button" whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }} aria-label={label} onClick={onClick} className={`grid h-11 w-11 place-items-center rounded-full border transition-colors ${danger ? "border-white/10 text-white/45 hover:border-red-300/35 hover:bg-red-300/[.06] hover:text-red-200" : "border-white/10 text-white/50 hover:border-[#F0D98C]/40 hover:bg-[#F0D98C]/[.05] hover:text-[#F0D98C]"}`}>{children}</motion.button>;
}

function LoadingState() {
  return <div className="grid min-h-56 place-items-center"><div className="flex items-center gap-3 text-[9px] uppercase tracking-[.2em] text-white/35"><LoaderCircle size={15} className="animate-spin text-[#F0D98C]" />Synchronizing records</div></div>;
}

function EmptyState({ archived, onCreate }: { archived: boolean; onCreate: () => void }) {
  return <div className="px-6 py-16 text-center"><Package size={22} className="mx-auto text-white/20" /><p className="mt-4 font-display text-lg font-bold uppercase text-white/55">{archived ? "No matching releases" : "The inventory is clear"}</p><p className="mt-2 text-xs text-white/35">{archived ? "Try another search or add a new release." : "Add the first sneaker release to begin the catalogue."}</p>{!archived && <button type="button" onClick={onCreate} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#F0D98C]/35 px-5 text-[9px] font-bold uppercase tracking-[.15em] text-[#F0D98C] transition hover:bg-[#F0D98C]/[.06]"><Plus size={14} />Create first release</button>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[9px] font-medium uppercase tracking-[.17em] text-white/45">{label}<div className="mt-2 [&>input]:min-h-12 [&>input]:w-full [&>input]:border [&>input]:border-white/10 [&>input]:bg-white/[.025] [&>input]:px-4 [&>input]:text-sm [&>input]:normal-case [&>input]:tracking-normal [&>input]:text-white [&>input]:outline-none [&>input]:transition-colors [&>input]:focus:border-[#F0D98C]/55 [&>select]:min-h-12 [&>select]:w-full [&>select]:border [&>select]:border-white/10 [&>select]:bg-[#151517] [&>select]:px-4 [&>select]:text-sm [&>select]:normal-case [&>select]:tracking-normal [&>select]:text-white [&>select]:outline-none [&>select]:focus:border-[#F0D98C]/55 [&>textarea]:w-full [&>textarea]:resize-y [&>textarea]:border [&>textarea]:border-white/10 [&>textarea]:bg-white/[.025] [&>textarea]:px-4 [&>textarea]:py-3 [&>textarea]:text-sm [&>textarea]:normal-case [&>textarea]:tracking-normal [&>textarea]:text-white [&>textarea]:outline-none [&>textarea]:focus:border-[#F0D98C]/55">{children}</div></label>;
}
