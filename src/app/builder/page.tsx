"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, SaveCheck, RotateCcw, Download, ChevronDown, ChevronRight, EyeOff, Eye, Plus, X, Loader2, CopyCheck, FileText, MessageSquare, Check, ArrowUp, ArrowDown, SendHorizontal } from "lucide-react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase-client";
import { downloadPdf } from "@/lib/download-pdf";
import type { Entry, ResumeSection, ResumeData } from "./types";
import Standard1Col from "./templates/Standard1Col";
import Standard2Col from "./templates/Standard2Col";
import Latex from "./templates/Latex";
import Vivid from "./templates/Vivid";

const TEMPLATES = [
  { id: "swiss-1col", label: "Swiss 1-col" },
  { id: "swiss-2col", label: "Swiss 2-col" },
  { id: "modern-1col", label: "Modern 1-col" },
  { id: "modern-2col", label: "Modern 2-col" },
  { id: "latex", label: "LaTeX" },
  { id: "clean", label: "Clean" },
  { id: "vivid", label: "Vivid" },
];

const ACCENT_COLORS = ["#7c3aed", "#0284c7", "#059669", "#dc2626", "#f97316", "#000000"];

const SECTION_TYPES = ["personal_info", "summary", "experience", "education", "projects", "additional"];
const SECTION_LABELS: Record<string, string> = {
  personal_info: "Personal Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  additional: "Additional",
};

interface BuilderUser {
  id: string;
  email?: string;
}

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const supabase = createClient();
  const [user, setUser] = useState<BuilderUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTION_TYPES));
  const [activeTab, setActiveTab] = useState<"resume" | "cover" | "outreach">("resume");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSections, setAiSections] = useState<string[]>([...SECTION_TYPES]);
  const [aiInstruction, setAiInstruction] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [outreachMsg, setOutreachMsg] = useState("");
  const [coverSaving, setCoverSaving] = useState(false);
  const [outreachSaving, setOutreachSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sectionNameEdits, setSectionNameEdits] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const cleanRef = useRef<string>("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSaveRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      if (!id) { router.push("/dashboard"); return; }
      await fetchResume(id);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const loadAttachments = async () => {
      try {
        const [clRes, omRes] = await Promise.all([
          fetch(`/api/cover-letters?resumeId=${id}`),
          fetch(`/api/outreach?resumeId=${id}`),
        ]);
        if (clRes.ok) {
          const clData = await clRes.json();
          if (clData.coverLetters?.length > 0) setCoverLetter(clData.coverLetters[0].content);
        }
        if (omRes.ok) {
          const omData = await omRes.json();
          if (omData.messages?.length > 0) setOutreachMsg(omData.messages[0].content);
        }
      } catch {}
    };
    loadAttachments();
  }, [id]);

  const fetchResume = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      const data = await res.json();
      if (!data.resume) { router.push("/dashboard"); return; }
      const r = data.resume;
      const sections: ResumeSection[] = (r.sections || []).map((s: any) => {
        const entries: Entry[] = [];
        if (s.type === "experience") {
          (s.experienceEntries || []).forEach((e: any) => entries.push({ ...e, type: "experience", bullets: e.bullets || [] }));
        } else if (s.type === "education") {
          (s.educationEntries || []).forEach((e: any) => entries.push({ ...e, type: "education", bullets: e.bullets || [] }));
        } else if (s.type === "projects") {
          (s.projectEntries || []).forEach((e: any) => entries.push({ ...e, type: "projects", bullets: e.bullets || [] }));
        } else if (s.type === "additional") {
          (s.customEntries || []).forEach((e: any) => entries.push({ ...e, type: "additional", bullets: e.bullets || [] }));
        } else if (s.type === "summary" || s.type === "personal_info") {
          (s.customEntries || []).forEach((e: any) => entries.push({ ...e, type: s.type, bullets: e.bullets || [] }));
        }
        entries.sort((a, b) => a.order - b.order);
        return { id: s.id, type: s.type, order: s.order, visible: s.visible, name: s.name, entries };
      });
      sections.sort((a, b) => a.order - b.order);
      const normalized: ResumeData = {
        id: r.id,
        title: r.title || "Untitled",
        templateId: r.templateId || "swiss-1col",
        pageSize: r.pageSize || "A4",
        accentColor: r.accentColor || "#7c3aed",
        status: r.status,
        sections,
      };
      setResume(normalized);
      cleanRef.current = JSON.stringify(normalized);
      setDirty(false);
    } catch (e) {
      console.error("Failed to fetch resume", e);
      showToast("Failed to load resume", "error");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const markDirty = useCallback(() => {
    setDirty(true);
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!dirty || !resume) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSaveRef.current();
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [dirty, resume]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes.";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!resume || !dirty) return;
    try {
      localStorage.setItem(`resume-builder-backup-${resume.id}`, JSON.stringify(resume));
    } catch {}
  }, [resume, dirty]);

  const updateResume = useCallback((patch: Partial<ResumeData>) => {
    setResume((prev) => (prev ? { ...prev, ...patch } : prev));
    markDirty();
  }, [markDirty]);

  const updateSection = useCallback((sectionId: string, patch: Partial<ResumeSection>) => {
    setResume((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s));
      return { ...prev, sections };
    });
    markDirty();
  }, [markDirty]);

  const updateEntry = useCallback((sectionId: string, entryId: string, patch: Partial<Entry>) => {
    setResume((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const entries = s.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e));
        return { ...s, entries };
      });
      return { ...prev, sections };
    });
    markDirty();
  }, [markDirty]);

  const moveEntry = useCallback((sectionId: string, entryId: string, dir: -1 | 1) => {
    setResume((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const entries = [...s.entries];
        const idx = entries.findIndex((e) => e.id === entryId);
        if (idx === -1) return s;
        const target = idx + dir;
        if (target < 0 || target >= entries.length) return s;
        [entries[idx], entries[target]] = [entries[target], entries[idx]];
        entries.forEach((e, i) => (e.order = i));
        return { ...s, entries };
      });
      return { ...prev, sections };
    });
    markDirty();
  }, [markDirty]);

  const toggleSection = (type: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleEntry = (entryId: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      const sections = resume.sections.map((s) => ({
        type: s.type,
        order: s.order,
        visible: s.visible,
        name: s.name,
        entries: s.entries.map((e) => ({
          order: e.order,
          type: e.type,
          title: e.title,
          company: e.company,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          institution: e.institution,
          degree: e.degree,
          field: e.field,
          gpa: e.gpa,
          name: e.name,
          description: e.description,
          url: e.url,
          content: e.content,
          bullets: e.bullets,
        })),
      }));
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: resume.templateId,
          pageSize: resume.pageSize,
          accentColor: resume.accentColor,
          title: resume.title,
          sections,
        }),
      });
      const data = await res.json();
      if (data.resume) {
        const r = data.resume;
        const normSections: ResumeSection[] = (r.sections || []).map((s: any) => {
          const entries: Entry[] = [];
          if (s.type === "experience") {
            (s.experienceEntries || []).forEach((e: any) => entries.push({ ...e, type: "experience", bullets: e.bullets || [] }));
          } else if (s.type === "education") {
            (s.educationEntries || []).forEach((e: any) => entries.push({ ...e, type: "education", bullets: e.bullets || [] }));
          } else if (s.type === "projects") {
            (s.projectEntries || []).forEach((e: any) => entries.push({ ...e, type: "projects", bullets: e.bullets || [] }));
          } else {
            (s.customEntries || []).forEach((e: any) => entries.push({ ...e, type: s.type, bullets: e.bullets || [] }));
          }
          entries.sort((a: Entry, b: Entry) => a.order - b.order);
          return { id: s.id, type: s.type, order: s.order, visible: s.visible, name: s.name, entries };
        });
        normSections.sort((a: ResumeSection, b: ResumeSection) => a.order - b.order);
        const normalized: ResumeData = {
          id: r.id,
          title: r.title || "Untitled",
          templateId: r.templateId || "swiss-1col",
          pageSize: r.pageSize || "A4",
          accentColor: r.accentColor || "#7c3aed",
          status: r.status,
          sections: normSections,
        };
        setResume(normalized);
        cleanRef.current = JSON.stringify(normalized);
        setDirty(false);
        showToast("Saved", "success");
      }
    } catch (e) {
      console.error("Save failed", e);
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  handleSaveRef.current = handleSave;

  const handleReset = () => {
    if (!resume) return;
    try {
      const clean = JSON.parse(cleanRef.current);
      setResume(clean);
      setDirty(false);
    } catch { }
  };

  const handleDownload = async () => {
    const previewEl = document.getElementById("preview-content");
    if (!previewEl) return;
    try {
      await downloadPdf(previewEl, `${resume?.title || "resume"}.pdf`, resume?.pageSize);
    } catch (e) {
      console.error("PDF generation failed", e);
      showToast("PDF download failed", "error");
    }
  };

  const handleAiRegenerate = async () => {
    if (!resume) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: aiSections, instruction: aiInstruction }),
      });
      const data = await res.json();
      if (data.resume) {
        const r = data.resume;
        const sections: ResumeSection[] = (r.sections || []).map((s: any) => {
          const entries: Entry[] = [];
          if (s.type === "experience") {
            (s.experienceEntries || []).forEach((e: any) => entries.push({ ...e, type: "experience", bullets: e.bullets || [] }));
          } else if (s.type === "education") {
            (s.educationEntries || []).forEach((e: any) => entries.push({ ...e, type: "education", bullets: e.bullets || [] }));
          } else if (s.type === "projects") {
            (s.projectEntries || []).forEach((e: any) => entries.push({ ...e, type: "projects", bullets: e.bullets || [] }));
          } else {
            (s.customEntries || []).forEach((e: any) => entries.push({ ...e, type: s.type, bullets: e.bullets || [] }));
          }
          entries.sort((a, b) => a.order - b.order);
          return { id: s.id, type: s.type, order: s.order, visible: s.visible, name: s.name, entries };
        });
        sections.sort((a, b) => a.order - b.order);
        setResume((prev) => (prev ? { ...prev, sections } : prev));
        markDirty();
      }
      setAiModalOpen(false);
    } catch (e) {
      console.error("AI regenerate failed", e);
      showToast("AI regeneration failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCover = async () => {
    if (!resume || !coverLetter.trim()) return;
    setCoverSaving(true);
    try {
      await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, content: coverLetter }),
      });
      showToast("Cover letter saved", "success");
    } catch (e) {
      console.error("Save cover letter failed", e);
      showToast("Failed to save cover letter", "error");
    } finally {
      setCoverSaving(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!resume) return;
    if (coverLetter.trim() && !window.confirm("Replace your current cover letter with a generated template?")) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: ["cover_letter"], instruction: "Generate a professional cover letter based on this resume." }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate cover letter");
      }
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
        showToast("Cover letter generated", "success");
      }
    } catch (e: any) {
      console.error("Generate cover letter failed", e);
      showToast(e.message || "Failed to generate cover letter", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveOutreach = async () => {
    if (!resume || !outreachMsg.trim()) return;
    setOutreachSaving(true);
    try {
      await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, content: outreachMsg }),
      });
      showToast("Outreach message saved", "success");
    } catch (e) {
      console.error("Save outreach failed", e);
      showToast("Failed to save outreach message", "error");
    } finally {
      setOutreachSaving(false);
    }
  };

  const handleCopyOutreach = async () => {
    try {
      await navigator.clipboard.writeText(outreachMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  if (loading || !resume) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans pt-16">
        <NavBar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Loading builder...
          </div>
        </div>
      </div>
    );
  }

  const template = TEMPLATES.find((t) => t.id === resume.templateId) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <NavBar />
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 text-sm font-mono border-2 border-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-all ${
          toast.type === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
        }`}>
          {toast.message}
        </div>
      )}
      <div className="pt-16">
        <div className="border-b-2 border-ink bg-canvas-alt px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg">{resume.title}</h1>
            {dirty && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" title="Unsaved changes" />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
            >
              <Sparkles size={14} /> AI Regenerate
            </button>
            <button onClick={handleSave} disabled={saving || !dirty}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <SaveCheck size={14} />}
              Save
            </button>
            <button onClick={handleReset} disabled={!dirty}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-40"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-all"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-8rem)]">
          <div className="w-[420px] min-w-[320px] border-r-2 border-ink overflow-y-auto bg-canvas-alt">
            <div className="p-4 border-b-2 border-ink space-y-3">
              <div className="flex flex-wrap gap-1">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => updateResume({ templateId: t.id })}
                    className={`text-xs font-mono px-2.5 py-1 border-2 transition-all ${
                      resume.templateId === t.id
                        ? "border-ink bg-canvas text-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
                        : "border-transparent text-ink-soft hover:text-ink hover:border-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button key={c} onClick={() => updateResume({ accentColor: c })}
                      className={`w-5 h-5 border-2 transition-all ${
                        resume.accentColor === c ? "border-ink shadow-[2px_2px_0_rgba(0,0,0,0.25)] scale-110" : "border-ink/30"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <select value={resume.pageSize} onChange={(e) => updateResume({ pageSize: e.target.value })}
                  className="ml-auto text-xs font-mono bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {resume.sections.map((section) => {
                const isExpanded = expandedSections.has(section.type);
                const label = section.name || SECTION_LABELS[section.type] || section.type;
                const canReorder = ["experience", "education", "projects"].includes(section.type);
                return (
                  <div key={section.id} className="border-2 border-ink bg-canvas">
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <button onClick={() => toggleSection(section.type)} className="p-0.5 text-ink-soft hover:text-ink">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <input
                        value={sectionNameEdits[section.id] ?? label}
                        onChange={(e) => setSectionNameEdits((prev) => ({ ...prev, [section.id]: e.target.value }))}
                        onBlur={() => {
                          const newName = sectionNameEdits[section.id]?.trim();
                          if (newName !== undefined) {
                            updateSection(section.id, { name: newName });
                          }
                        }}
                        className="flex-1 text-xs font-mono font-bold uppercase tracking-wider bg-transparent border-none outline-none text-ink"
                      />
                      <button onClick={() => updateSection(section.id, { visible: !section.visible })}
                        className="p-0.5 text-ink-soft hover:text-ink"
                        title={section.visible ? "Hide section" : "Show section"}
                      >
                        {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      {section.entries.length > 0 && (
                        <span className="text-[10px] font-mono text-ink-soft bg-canvas-alt border border-ink/30 px-1.5">{section.entries.length}</span>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="border-t-2 border-ink p-2 space-y-1">
                        {section.type === "personal_info" && (() => {
                          const piEntry = section.entries[0];
                          const parsed: Record<string, string> = (() => {
                            if (!piEntry?.content) return {};
                            try { return JSON.parse(piEntry.content); } catch { return {}; }
                          })();
                          const setPiField = (field: string, value: string) => {
                            if (piEntry) {
                              const current = (() => { try { return JSON.parse(piEntry.content || "{}"); } catch { return {}; } })();
                              current[field] = value;
                              updateEntry(section.id, piEntry.id, { content: JSON.stringify(current) });
                            } else {
                              const newEntry: Entry = { id: crypto.randomUUID(), order: 0, type: "personal_info", content: JSON.stringify({ [field]: value }), bullets: [] };
                              setResume((prev) => {
                                if (!prev) return prev;
                                const sections = prev.sections.map((s) => {
                                  if (s.id !== section.id) return s;
                                  return { ...s, entries: [newEntry] };
                                });
                                return { ...prev, sections };
                              });
                              markDirty();
                            }
                          };
                          return (
                            <div className="space-y-1.5 font-mono">
                              {["name", "email", "phone", "location", "links"].map((field) => (
                                <input key={field} value={parsed[field] || ""} onChange={(e) => setPiField(field, e.target.value)}
                                  className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none text-[11px]" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} />
                              ))}
                            </div>
                          );
                        })()}
                        {section.type === "summary" && (
                          <textarea
                            value={section.entries[0]?.content || ""}
                            onChange={(e) => {
                              const entry = section.entries[0] || { id: crypto.randomUUID(), order: 0, type: "summary", content: "", bullets: [] };
                              updateEntry(section.id, entry.id, { content: e.target.value });
                            }}
                            className="w-full text-xs font-mono bg-canvas border-2 border-ink p-2 text-ink outline-none resize-none h-20"
                            placeholder="Write a professional summary..."
                          />
                        )}
                        {canReorder && section.entries.map((entry, idx) => {
                          const entryExpanded = expandedEntries.has(entry.id);
                          return (
                            <div key={entry.id} className="border border-ink/50 bg-canvas-alt">
                              <div className="flex items-center gap-1 px-2 py-1">
                                <button onClick={() => moveEntry(section.id, entry.id, -1)} disabled={idx === 0}
                                  className="p-0.5 text-ink-soft hover:text-ink disabled:opacity-20"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button onClick={() => moveEntry(section.id, entry.id, 1)} disabled={idx === section.entries.length - 1}
                                  className="p-0.5 text-ink-soft hover:text-ink disabled:opacity-20"
                                >
                                  <ArrowDown size={12} />
                                </button>
                                <button onClick={() => toggleEntry(entry.id)} className="flex-1 text-left text-[11px] font-mono truncate text-ink">
                                  {section.type === "experience" && (entry.title || entry.company || "New Experience")}
                                  {section.type === "education" && (entry.degree || entry.institution || "New Education")}
                                  {section.type === "projects" && (entry.name || "New Project")}
                                </button>
                                <button onClick={() => toggleEntry(entry.id)} className="p-0.5 text-ink-soft">
                                  {entryExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>
                              </div>
                              {entryExpanded && (
                                <div className="border-t border-ink/50 p-2 space-y-1.5 text-xs">
                                  {section.type === "experience" && (
                                    <>
                                      <input value={entry.title || ""} onChange={(e) => updateEntry(section.id, entry.id, { title: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Job Title" />
                                      <input value={entry.company || ""} onChange={(e) => updateEntry(section.id, entry.id, { company: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Company" />
                                      <div className="flex gap-1">
                                        <input value={entry.startDate || ""} onChange={(e) => updateEntry(section.id, entry.id, { startDate: e.target.value })}
                                          className="flex-1 bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Start" />
                                        <input value={entry.endDate || ""} onChange={(e) => updateEntry(section.id, entry.id, { endDate: e.target.value })}
                                          className="flex-1 bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="End" />
                                      </div>
                                      <label className="flex items-center gap-1.5 text-[11px] font-mono text-ink-soft">
                                        <input type="checkbox" checked={entry.current || false} onChange={(e) => updateEntry(section.id, entry.id, { current: e.target.checked })} className="border-ink" />
                                        Current
                                      </label>
                                    </>
                                  )}
                                  {section.type === "education" && (
                                    <>
                                      <input value={entry.institution || ""} onChange={(e) => updateEntry(section.id, entry.id, { institution: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Institution" />
                                      <input value={entry.degree || ""} onChange={(e) => updateEntry(section.id, entry.id, { degree: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Degree" />
                                      <input value={entry.field || ""} onChange={(e) => updateEntry(section.id, entry.id, { field: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Field of study" />
                                    </>
                                  )}
                                  {section.type === "projects" && (
                                    <>
                                      <input value={entry.name || ""} onChange={(e) => updateEntry(section.id, entry.id, { name: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="Project Name" />
                                      <textarea value={entry.description || ""} onChange={(e) => updateEntry(section.id, entry.id, { description: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px] resize-none h-14" placeholder="Description" />
                                      <input value={entry.url || ""} onChange={(e) => updateEntry(section.id, entry.id, { url: e.target.value })}
                                        className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px]" placeholder="URL" />
                                    </>
                                  )}
                                  {section.type === "additional" && (
                                    <textarea value={entry.content || ""} onChange={(e) => updateEntry(section.id, entry.id, { content: e.target.value })}
                                      className="w-full bg-canvas border border-ink px-2 py-1 text-ink outline-none font-mono text-[11px] resize-none h-14" placeholder="Content (skills, languages, certifications...)" />
                                  )}
                                  <div className="space-y-0.5">
                                    {entry.bullets.map((bullet, bi) => (
                                      <div key={bi} className="flex gap-1">
                                        <input value={bullet} onChange={(e) => {
                                          const newBullets = [...entry.bullets];
                                          newBullets[bi] = e.target.value;
                                          updateEntry(section.id, entry.id, { bullets: newBullets });
                                        }}
                                          className="flex-1 bg-canvas border border-ink px-2 py-0.5 text-ink outline-none font-mono text-[11px]" placeholder="Bullet point" />
                                        <button onClick={() => {
                                          updateEntry(section.id, entry.id, { bullets: entry.bullets.filter((_, i) => i !== bi) });
                                        }} className="p-0.5 text-ink-soft hover:text-[#dc2626]"><X size={10} /></button>
                                      </div>
                                    ))}
                                    <button onClick={() => {
                                      updateEntry(section.id, entry.id, { bullets: [...entry.bullets, ""] });
                                    }} className="flex items-center gap-1 text-[10px] font-mono text-ink-soft hover:text-ink">
                                      <Plus size={10} /> Add bullet
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {canReorder && (
                          <button onClick={() => {
                            const newEntry: Entry = {
                              id: crypto.randomUUID(),
                              order: section.entries.length,
                              type: section.type,
                              title: "",
                              company: "",
                              institution: "",
                              degree: "",
                              name: "",
                              description: "",
                              content: "",
                              bullets: [],
                            };
                            setResume((prev) => {
                              if (!prev) return prev;
                              const sections = prev.sections.map((s) => {
                                if (s.id !== section.id) return s;
                                return { ...s, entries: [...s.entries, newEntry] };
                              });
                              return { ...prev, sections };
                            });
                            setExpandedEntries((prev) => new Set(prev).add(newEntry.id));
                            markDirty();
                          }}
                            className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink px-1 py-0.5"
                          >
                            <Plus size={12} /> Add entry
                          </button>
                        )}
                        {section.type === "additional" && (
                          <button onClick={() => {
                            const newEntry: Entry = {
                              id: crypto.randomUUID(),
                              order: section.entries.length,
                              type: "additional",
                              content: "",
                              bullets: [],
                            };
                            setResume((prev) => {
                              if (!prev) return prev;
                              const sections = prev.sections.map((s) => {
                                if (s.id !== section.id) return s;
                                return { ...s, entries: [...s.entries, newEntry] };
                              });
                              return { ...prev, sections };
                            });
                            markDirty();
                          }}
                            className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink px-1 py-0.5"
                          >
                            <Plus size={12} /> Add entry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex border-b-2 border-ink bg-canvas-alt">
              {(["resume", "cover", "outreach"] as const).map((tab) => {
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-mono uppercase tracking-wider border-r-2 border-ink transition-all ${
                      activeTab === tab
                        ? "bg-canvas text-ink shadow-[inset_0_-2px_0_0_rgba(0,0,0,1)]"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {tab === "resume" && <FileText size={14} />}
                    {tab === "cover" && <MessageSquare size={14} />}
                    {tab === "outreach" && <SendHorizontal size={14} />}
                    {tab === "resume" ? "Resume" : tab === "cover" ? "Cover Letter" : "Outreach"}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto bg-canvas p-6">
              {activeTab === "resume" && (
                <div id="preview-content">
                  <PreviewSection resume={resume} template={template} />
                </div>
              )}
              {activeTab === "cover" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-xs font-mono text-ink-soft">Cover Letter</p>
                  <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full h-[50vh] bg-canvas-alt border-2 border-ink p-4 text-sm font-sans text-ink outline-none resize-none"
                    placeholder="Write your cover letter here..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleGenerateCover} disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                    >
                      {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      AI Generate
                    </button>
                    <p className="text-[10px] font-mono text-ink-soft/60 -mt-1">Uses a basic template (LLM integration TBD)</p>
                    <button onClick={handleSaveCover} disabled={coverSaving || !coverLetter.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
                    >
                      {coverSaving ? <Loader2 size={14} className="animate-spin" /> : <SaveCheck size={14} />}
                      Save
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "outreach" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-xs font-mono text-ink-soft">Outreach Message</p>
                  <textarea value={outreachMsg} onChange={(e) => setOutreachMsg(e.target.value)}
                    className="w-full h-[50vh] bg-canvas-alt border-2 border-ink p-4 text-sm font-sans text-ink outline-none resize-none"
                    placeholder="Write your outreach message..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveOutreach} disabled={outreachSaving || !outreachMsg.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
                    >
                      {outreachSaving ? <Loader2 size={14} className="animate-spin" /> : <SaveCheck size={14} />}
                      Save
                    </button>
                    <button onClick={handleCopyOutreach}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                    >
                      {copied ? <Check size={14} /> : <CopyCheck size={14} />}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !generating && setAiModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-lg w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-6">
            <h2 className="text-lg font-display mb-4">AI Regenerate</h2>
            <p className="text-xs font-mono text-ink-soft mb-4">Select sections to regenerate and optionally provide instructions.</p>
            <div className="space-y-2 mb-4">
              {resume.sections.filter((s) => s.type !== "personal_info").map((section) => {
                const label = section.name || SECTION_LABELS[section.type] || section.type;
                return (
                  <label key={section.id} className="flex items-center gap-2 text-sm font-mono text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSections.includes(section.type)}
                      onChange={(e) => {
                        if (e.target.checked) setAiSections((prev) => [...prev, section.type]);
                        else setAiSections((prev) => prev.filter((t) => t !== section.type));
                      }}
                      className="border-2 border-ink"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
            <textarea value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)}
              className="w-full bg-canvas border-2 border-ink p-3 text-sm font-mono text-ink outline-none resize-none h-20 mb-4"
              placeholder="Optional: add specific instructions (e.g., 'Emphasize leadership and team management')"
            />
            <div className="flex gap-2">
              <button onClick={handleAiRegenerate} disabled={generating || aiSections.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {generating ? "Generating..." : "Regenerate"}
              </button>
              <button onClick={() => setAiModalOpen(false)} disabled={generating}
                className="px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all"
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

function PreviewSection({ resume, template }: { resume: ResumeData; template: typeof TEMPLATES[0] }) {
  const piSection = resume.sections.find(s => s.type === "personal_info");
  const piEntry = piSection?.entries?.[0];
  const piData: Record<string, string> = (() => {
    if (!piEntry?.content) return {};
    try { return JSON.parse(piEntry.content); } catch { return {}; }
  })();
  const displayName = piData.name || "Your Name";
  const contactParts = [piData.email, piData.phone, piData.location, piData.links].filter(Boolean);
  const contactLine = contactParts.length > 0 ? contactParts.join(" • ") : "your@email.com • (555) 000-0000";

  const props = { resume, displayName, contactLine, template };

  switch (resume.templateId) {
    case "swiss-2col":
    case "modern-2col":
      return <Standard2Col {...props} />;
    case "latex":
      return <Latex {...props} />;
    case "vivid":
      return <Vivid {...props} />;
    default:
      return <Standard1Col {...props} />;
  }
}
