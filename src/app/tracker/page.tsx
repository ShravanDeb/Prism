"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, ChevronLeft, ChevronRight, Loader2, ExternalLink,
  Trash2, GripVertical, X, FileText, ArrowRight, Check,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase-client";

const STATUSES = ["Saved", "Applied", "No Response", "Response", "Interview", "Accepted", "Rejected"] as const;

const STATUS_COLORS: Record<string, string> = {
  "Saved": "bg-[#64748b]",
  "Applied": "bg-[#3b82f6]",
  "No Response": "bg-[#f59e0b]",
  "Response": "bg-[#10b981]",
  "Interview": "bg-[#8b5cf6]",
  "Accepted": "bg-[#059669]",
  "Rejected": "bg-[#ef4444]",
};

interface TrackerCard {
  id: string;
  status: string;
  notes: string | null;
  company: string | null;
  jobTitle: string | null;
  resumeId: string | null;
  createdAt: string;
  jobDescription: { rawText: string; parsedKeywords: string[] } | null;
  tailoredResume: { title: string } | null;
}

interface AddForm {
  jobTitle: string;
  company: string;
  jdText: string;
  notes: string;
  status: string;
}

export default function TrackerPage() {
  const router = useRouter();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<TrackerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<TrackerCard | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>({ jobTitle: "", company: "", jdText: "", notes: "", status: "Saved" });
  const [adding, setAdding] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTarget, setBulkTarget] = useState("");
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      await fetchCards();
    };
    init();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/tracker/cards");
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      console.error("Failed to fetch cards", e);
    } finally {
      setLoading(false);
    }
  };

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    setCanScroll({ left: el.scrollLeft > 10, right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10 });
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const scrollToColumn = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const col = el.children[index] as HTMLElement;
    if (col) col.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
    setDragCardId(cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId) return;
    setDragCardId(null);
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c)));
    try {
      await fetch(`/api/tracker/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update card status", e);
      await fetchCards();
    }
  };

  const handleBulkMove = async () => {
    if (!bulkTarget || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/tracker/cards/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkTarget }),
        })
      )
    );
    setCards((prev) => prev.map((c) => (selectedIds.has(c.id) ? { ...c, status: bulkTarget } : c)));
    setSelectedIds(new Set());
    setBulkTarget("");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} application${selectedIds.size > 1 ? "s" : ""}? This can't be undone.`)) return;
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => fetch(`/api/tracker/cards/${id}`, { method: "DELETE" })));
    setCards((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!addForm.jobTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/tracker/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: addForm.jobTitle.trim(),
          company: addForm.company.trim() || null,
          jdText: addForm.jdText.trim() || null,
          notes: addForm.notes.trim() || null,
          status: addForm.status,
        }),
      });
      const data = await res.json();
      if (data.card) {
        const full = await (await fetch(`/api/tracker/cards`)).json();
        setCards(full.cards || []);
      }
      setAddModalOpen(false);
      setAddForm({ jobTitle: "", company: "", jdText: "", notes: "", status: "Saved" });
    } catch (e) {
      console.error("Failed to add card", e);
    } finally {
      setAdding(false);
    }
  };

  const getCardsByStatus = (status: string) => cards.filter((c) => c.status === status);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans">
        <NavBar />
        <div className="pt-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Loading your board...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col pt-20 pb-0 overflow-hidden">
        <div className="px-4 md:px-6 flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-display leading-tight tracking-tight">
              <s className="decoration-ink decoration-2">Pipeline</s>{" "}
              <span className="bg-[#8b5cf6] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Tracker</span>.
            </h1>
            <p className="text-ink-soft font-mono text-xs mt-1">
              {cards.length} application{cards.length !== 1 ? "s" : ""} in the wild
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBulkMode((b) => !b)}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider border-2 transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] ${
                bulkMode
                  ? "border-ink bg-ink text-canvas"
                  : "border-ink bg-canvas text-ink-soft hover:text-ink"
              }`}
            >
              {bulkMode ? "Exit Bulk" : "Bulk Select"}
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider border-2 border-ink bg-[#8b5cf6] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
            >
              <Plus size={14} /> Add Application
            </button>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center py-20 border-2 border-ink border-dashed bg-canvas-alt shadow-[6px_6px_0_rgba(0,0,0,0.25)]">
              <FileText size={48} className="mx-auto text-ink-soft/30 mb-4" />
              <h2 className="text-xl font-display text-ink mb-2">Your board is looking lonely.</h2>
              <p className="text-sm text-ink-soft mb-6 font-mono">
                No applications yet. Which is fine — we all procrastinate. But maybe drop one in so this page isn&apos;t just
                a beautiful waste of pixels?
              </p>
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#8b5cf6] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <Plus size={16} /> Add Your First Application
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 min-h-0 px-4 md:px-6">
            {canScroll.left && (
              <button
                onClick={() => scrollBy("left")}
                className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border-2 border-ink bg-canvas-alt shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {canScroll.right && (
              <button
                onClick={() => scrollBy("right")}
                className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border-2 border-ink bg-canvas-alt shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:translate-x-[1px] hover:-translate-y-[1px] transition-all flex items-center justify-center"
              >
                <ChevronRight size={20} />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="flex gap-4 h-full overflow-x-auto pb-4"
              style={{ scrollbarWidth: "thin" }}
            >
              {STATUSES.map((status, idx) => {
                const columnCards = getCardsByStatus(status);
                return (
                  <div
                    key={status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <div className={`w-1.5 h-6 ${STATUS_COLORS[status]}`} />
                      <span className="font-mono text-sm font-bold uppercase tracking-wider">{status}</span>
                      <span className="font-mono text-xs text-ink-soft ml-auto tabular-nums">{columnCards.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px] rounded-none">
                      {columnCards.map((card) => (
                        <div
                          key={card.id}
                          draggable={!bulkMode}
                          onDragStart={(e) => handleDragStart(e, card.id)}
                          onDragEnd={() => setDragCardId(null)}
                          onClick={() => !bulkMode && setDetailCard(card)}
                          className={`bg-canvas-alt border-2 border-ink shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all p-4 cursor-pointer ${
                            dragCardId === card.id ? "opacity-40" : ""
                          } ${selectedIds.has(card.id) ? "ring-2 ring-[#8b5cf6]" : ""}`}
                        >
                          {bulkMode && (
                            <div className="flex items-center gap-2 mb-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSelect(card.id); }}
                                className={`w-5 h-5 border-2 border-ink flex items-center justify-center transition-all ${
                                  selectedIds.has(card.id) ? "bg-[#8b5cf6] text-white" : "bg-canvas"
                                }`}
                              >
                                {selectedIds.has(card.id) && <Check size={12} />}
                              </button>
                              <div className="w-4 h-4 flex items-center justify-center text-ink-soft cursor-grab active:cursor-grabbing">
                                <GripVertical size={14} />
                              </div>
                            </div>
                          )}
                          <h3 className="font-mono text-sm font-bold leading-snug mb-1">
                            {card.jobTitle || "Untitled"}
                          </h3>
                          <p className="font-sans text-xs text-ink-soft mb-2">
                            {card.company || "Unknown company"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">
                              {card.tailoredResume?.title || "No resume"}
                            </span>
                            <span className="font-mono text-[10px] text-ink-soft tabular-nums">
                              {new Date(card.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                        className="h-12 border-2 border-dashed border-ink/30 flex items-center justify-center"
                      >
                        <span className="font-mono text-[10px] text-ink-soft/40 uppercase tracking-wider">
                          Drop here
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {cards.length > 0 && (
          <div className="flex-shrink-0 border-t-2 border-ink bg-canvas-alt px-4 md:px-6 py-3">
            <div className="flex items-center gap-4 max-w-full overflow-x-auto">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-soft flex-shrink-0">Stages</span>
              {STATUSES.map((status, idx) => {
                const count = getCardsByStatus(status).length;
                return (
                  <button
                    key={status}
                    onClick={() => scrollToColumn(idx)}
                    className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 border-2 border-ink bg-canvas hover:bg-canvas-alt transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px]"
                  >
                    <div className={`w-2 h-2 ${STATUS_COLORS[status]}`} />
                    <span className="font-mono text-xs uppercase">{status}</span>
                    <span className="font-mono text-xs text-ink-soft tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {bulkMode && selectedIds.size > 0 && (
          <div className="flex-shrink-0 border-t-2 border-ink bg-canvas-alt px-4 md:px-6 py-3 flex items-center gap-3">
            <span className="font-mono text-xs text-ink-soft tabular-nums">{selectedIds.size} selected</span>
            <select
              value={bulkTarget}
              onChange={(e) => setBulkTarget(e.target.value)}
              className="font-mono text-xs border-2 border-ink bg-canvas px-3 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
            >
              <option value="">Move to...</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleBulkMove}
              disabled={!bulkTarget}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border-2 border-ink bg-[#8b5cf6] text-white shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowRight size={12} /> Bulk Move
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border-2 border-ink bg-canvas text-[#ef4444] shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
            >
              <Trash2 size={12} /> Bulk Delete
            </button>
          </div>
        )}
      </main>

      {detailCard && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetailCard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-6 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className="font-mono text-lg font-bold">{detailCard.jobTitle || "Untitled"}</h2>
                <p className="font-sans text-sm text-ink-soft">{detailCard.company || "Unknown company"}</p>
              </div>
              <button onClick={() => setDetailCard(null)} className="p-1 border-2 border-ink bg-canvas hover:bg-[#ef4444] hover:text-white transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <div className={`w-2 h-2 ${STATUS_COLORS[detailCard.status]}`} />
              <span className="font-mono text-xs uppercase tracking-wider">{detailCard.status}</span>
              <span className="font-mono text-[10px] text-ink-soft ml-auto tabular-nums">
                Added {new Date(detailCard.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {detailCard.tailoredResume && (
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Linked Resume</span>
                  <a
                    href={detailCard.resumeId ? `/resumes/${detailCard.resumeId}` : "#"}
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-[#3b82f6] underline underline-offset-2"
                  >
                    {detailCard.tailoredResume.title} <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {detailCard.notes && (
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Notes</span>
                  <p className="font-sans text-sm whitespace-pre-wrap">{detailCard.notes}</p>
                </div>
              )}

              {detailCard.jobDescription?.rawText && (
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Job Description</span>
                  <div className="border-2 border-ink bg-canvas p-3 max-h-48 overflow-y-auto">
                    <p className="font-sans text-xs whitespace-pre-wrap leading-relaxed">
                      {detailCard.jobDescription.rawText}
                    </p>
                  </div>
                </div>
              )}

              {!detailCard.notes && !detailCard.jobDescription?.rawText && !detailCard.tailoredResume && (
                <p className="font-mono text-xs text-ink-soft text-center py-8">
                  Nothing extra here. Just a lone application floating in the void.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => !adding && setAddModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display">New Application</h2>
              <button
                onClick={() => setAddModalOpen(false)}
                disabled={adding}
                className="p-1 border-2 border-ink bg-canvas hover:bg-[#ef4444] hover:text-white transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Job Title *</label>
                <input
                  value={addForm.jobTitle}
                  onChange={(e) => setAddForm((f) => ({ ...f, jobTitle: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 font-mono text-sm shadow-[2px_2px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Company</label>
                <input
                  value={addForm.company}
                  onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 font-mono text-sm shadow-[2px_2px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Job Description</label>
                <textarea
                  value={addForm.jdText}
                  onChange={(e) => setAddForm((f) => ({ ...f, jdText: e.target.value }))}
                  placeholder="Paste the job description here. We'll auto-create the JD entry."
                  rows={4}
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 font-sans text-sm shadow-[2px_2px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Notes</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Screening call scheduled, recruiter seemed nice..."
                  rows={3}
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 font-sans text-sm shadow-[2px_2px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-ink-soft block mb-1">Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 font-mono text-sm shadow-[2px_2px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAdd}
                disabled={adding || !addForm.jobTitle.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#8b5cf6] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {adding ? "Adding..." : "Add Application"}
              </button>
              <button
                onClick={() => setAddModalOpen(false)}
                disabled={adding}
                className="px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
