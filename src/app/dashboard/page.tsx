"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2, Download, Pencil, X, Loader2, Calendar } from "lucide-react";
import NavBar from "@/components/NavBar";

interface Resume {
  id: string;
  title: string;
  templateId?: string;
  createdAt: string;
}

const templates = [
  { id: "classic", name: "Classic", description: "Traditional single-column layout", color: "bg-ink/5" },
  { id: "modern", name: "Modern", description: "Two-column with sidebar", color: "bg-[#7c3aed]/10" },
  { id: "minimal", name: "Minimal", description: "Clean, minimal design", color: "bg-[#0284c7]/10" },
  { id: "executive", name: "Executive", description: "Formal, executive style", color: "bg-[#0284c7]/10" },
  { id: "creative", name: "Creative", description: "Colorful, creative design", color: "bg-[#7c3aed]/10" },
  { id: "technical", name: "Technical", description: "Skills-focused layout", color: "bg-[#0284c7]/10" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateResume(templateId: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "master", title: "Untitled Resume", templateId }),
      });
      const data = await res.json();
      if (data.resume?.id) {
        router.push(`/editor?id=${data.resume.id}`);
      }
    } catch {
      setCreating(false);
    }
  }

  async function handleDeleteResume(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <NavBar />
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display leading-tight tracking-tight">
            Your <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Resumes</span>.
          </h1>
          <p className="text-ink-soft font-mono text-sm mt-2">
            Manage, edit, and create new resumes from your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <button
            onClick={() => setTemplateGalleryOpen(true)}
            className="group border-2 border-ink border-dashed bg-canvas-alt p-8 flex flex-col items-center justify-center gap-4 shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all min-h-[200px]"
          >
            <div className="w-16 h-16 border-2 border-ink bg-canvas flex items-center justify-center group-hover:bg-[#7c3aed] group-hover:text-white transition-all shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
              <Plus size={32} />
            </div>
            <span className="text-sm font-mono uppercase tracking-wider text-ink-soft group-hover:text-ink transition-colors">
              New Resume
            </span>
            <span className="text-xs text-ink-soft/60 text-center">Pick a template and start building</span>
          </button>

          {!loading &&
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="border-2 border-ink bg-canvas-alt p-6 flex flex-col gap-3 shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 border-2 border-ink bg-canvas flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft bg-canvas border border-ink/20 px-2 py-1">
                    {resume.templateId || "classic"}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-mono text-sm font-semibold truncate">{resume.title || "Untitled Resume"}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-ink-soft mt-1">
                    <Calendar size={10} />
                    {formatDate(resume.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/editor?id=${resume.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:bg-[#7c3aed] hover:text-white transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 text-xs font-mono border-2 border-ink bg-canvas text-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:bg-[#0284c7] hover:text-white transition-all">
                    <Download size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="flex items-center justify-center px-3 py-2 text-xs font-mono border-2 border-ink bg-canvas text-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:bg-[#dc2626] hover:text-white transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

          {!loading && resumes.length === 0 && (
            <div className="col-span-full mt-4 text-center py-20 border-2 border-ink border-dashed bg-canvas-alt">
              <div className="max-w-md mx-auto">
                <FileText size={48} className="mx-auto text-ink-soft/30 mb-4" />
                <h2 className="text-xl font-display text-ink mb-2">No resumes yet.</h2>
                <p className="text-sm text-ink-soft mb-6 font-mono">
                  Create your first resume by picking a template above.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#7c3aed]" />
            </div>
          )}
        </div>
      </main>

      {templateGalleryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => !creating && setTemplateGalleryOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display">Choose a Template</h2>
              <button
                onClick={() => setTemplateGalleryOpen(false)}
                disabled={creating}
                className="p-2 border-2 border-ink bg-canvas hover:bg-[#dc2626] hover:text-white transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleCreateResume(tmpl.id)}
                  disabled={creating}
                  className="group border-2 border-ink bg-canvas p-4 flex flex-col items-center gap-3 shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[5px_5px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-50"
                >
                  <div className={`w-full aspect-[3/4] border-2 border-ink/20 ${tmpl.color} flex items-center justify-center`}>
                    <FileText size={24} className="text-ink-soft/40" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                      {tmpl.name}
                    </span>
                    <span className="block text-[10px] font-mono text-ink-soft mt-1">
                      {tmpl.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {creating && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-mono text-ink-soft">
                <Loader2 size={16} className="animate-spin" />
                Creating resume...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
