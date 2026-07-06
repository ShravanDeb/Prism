"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sparkles, Edit, Download, Trash2, CheckCircle, Loader2, AlertCircle, X, ChevronLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import { downloadPdf } from "@/lib/download-pdf";

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  bullets: string[];
  order: number;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  gpa: string | null;
  bullets: string[];
  order: number;
}

interface ProjectEntry {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  bullets: string[];
  order: number;
}

interface CustomEntry {
  id: string;
  content: string;
  bullets: string[];
  order: number;
}

interface ResumeSection {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  name: string;
  experienceEntries: ExperienceEntry[];
  educationEntries: EducationEntry[];
  projectEntries: ProjectEntry[];
  customEntries: CustomEntry[];
}

interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  pageSize: string;
  accentColor: string;
  status: string;
  uploadedFileUrl: string | null;
  uploadedFileName: string | null;
  createdAt: string;
  updatedAt: string;
  sections: ResumeSection[];
  _type?: "master" | "tailored";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ready") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-[#059669] bg-[#059669]/10 text-[#059669] shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
        <CheckCircle size={12} /> Ready
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-[#0284c7] bg-[#0284c7]/10 text-[#0284c7] shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
        <Loader2 size={12} className="animate-spin" /> Processing
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
        <AlertCircle size={12} /> Parse Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono border-2 border-ink bg-canvas text-ink-soft shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
      {status}
    </span>
  );
}

function SectionRenderer({ section }: { section: ResumeSection }) {
  if (!section.visible) return null;

  if (section.type === "experience" && section.experienceEntries.length > 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-display font-bold border-b-2 border-ink pb-1 mb-4 uppercase tracking-tight">
          {section.name || "Experience"}
        </h2>
        {section.experienceEntries.map((exp) => (
          <div key={exp.id} className="mb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
              <div>
                <span className="font-semibold text-sm">{exp.title}</span>
                {exp.company && (
                  <span className="text-ink-soft text-sm"> — {exp.company}</span>
                )}
              </div>
              {(exp.startDate || exp.endDate) && (
                <span className="text-xs font-mono text-ink-soft shrink-0">
                  {exp.startDate || "—"} – {exp.current ? "Present" : exp.endDate || "—"}
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              )}
            </div>
            {exp.bullets.length > 0 && (
              <ul className="mt-2 space-y-1">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-ink flex gap-2">
                    <span className="text-ink-soft select-none shrink-0">–</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "education" && section.educationEntries.length > 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-display font-bold border-b-2 border-ink pb-1 mb-4 uppercase tracking-tight">
          {section.name || "Education"}
        </h2>
        {section.educationEntries.map((edu) => (
          <div key={edu.id} className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
              <div>
                <span className="font-semibold text-sm">{edu.institution}</span>
                {edu.degree && <span className="text-ink-soft text-sm"> — {edu.degree}</span>}
                {edu.field && <span className="text-ink-soft text-sm">, {edu.field}</span>}
              </div>
              {(edu.startDate || edu.endDate) && (
                <span className="text-xs font-mono text-ink-soft shrink-0">
                  {edu.startDate || "—"} – {edu.endDate || "Present"}
                </span>
              )}
            </div>
            {edu.gpa && <p className="text-xs font-mono text-ink-soft mt-1">GPA: {edu.gpa}</p>}
            {edu.bullets.length > 0 && (
              <ul className="mt-2 space-y-1">
                {edu.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-ink flex gap-2">
                    <span className="text-ink-soft select-none shrink-0">–</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "projects" && section.projectEntries.length > 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-display font-bold border-b-2 border-ink pb-1 mb-4 uppercase tracking-tight">
          {section.name || "Projects"}
        </h2>
        {section.projectEntries.map((proj) => (
          <div key={proj.id} className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{proj.name}</span>
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-[#0284c7] underline underline-offset-2"
                  >
                    {proj.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>
              {(proj.startDate || proj.endDate) && (
                <span className="text-xs font-mono text-ink-soft shrink-0">
                  {proj.startDate || "—"} – {proj.endDate || "Present"}
                </span>
              )}
            </div>
            {proj.description && <p className="text-sm text-ink-soft mt-1">{proj.description}</p>}
            {proj.bullets.length > 0 && (
              <ul className="mt-2 space-y-1">
                {proj.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-ink flex gap-2">
                    <span className="text-ink-soft select-none shrink-0">–</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section.type === "custom" && section.customEntries.length > 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-display font-bold border-b-2 border-ink pb-1 mb-4 uppercase tracking-tight">
          {section.name || "Additional"}
        </h2>
        {section.customEntries.map((entry) => (
          <div key={entry.id} className="mb-3">
            {entry.content && <p className="text-sm text-ink mb-1">{entry.content}</p>}
            {entry.bullets.length > 0 && (
              <ul className="space-y-1">
                {entry.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-ink flex gap-2">
                    <span className="text-ink-soft select-none shrink-0">–</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default function ResumeViewerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const titleInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enrichOpen, setEnrichOpen] = useState(false);

  const fetchResume = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Resume not found. It may have been deleted or never existed.");
        throw new Error("Failed to load resume. The API may be having a bad day.");
      }
      const data = await res.json();
      setResume(data.resume);
      setTitle(data.resume.title);
    } catch (e: any) {
      setError(e.message || "Something went wrong. We blame the internet.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleRename = async () => {
    if (!resume || title === resume.title || !title.trim()) {
      setRenaming(false);
      return;
    }
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        setResume((prev) => prev ? { ...prev, title: title.trim() } : prev);
      }
    } catch {
      // silently fail — renaming is a nicety, not a necessity
    }
    setRenaming(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setDeleteConfirm(false);
        setDeleting(false);
      }
    } catch {
      setDeleteConfirm(false);
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!printRef.current || !resume) return;
    try {
      await downloadPdf(printRef.current, `${resume.title || "resume"}.pdf`, resume.pageSize);
    } catch (e) {
      console.error("PDF download failed", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans pt-16">
        <NavBar />
        <div className="pt-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Summoning your resume from the digital void...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans pt-16">
        <NavBar />
        <div className="pt-24 max-w-xl mx-auto px-4">
          <div className="border-2 border-ink bg-canvas-alt shadow-[8px_8px_0_rgba(0,0,0,0.25)] p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-[#dc2626] mb-4" />
            <h2 className="text-xl font-display mb-2">Well, this is awkward.</h2>
            <p className="text-sm font-mono text-ink-soft mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={fetchResume}
                className="px-5 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                Try Again
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="px-5 py-3 text-sm font-mono border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) return null;

  const visibleSections = resume.sections.filter((s) => s.visible);
  const isTailored = resume._type === "tailored";

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pt-16">
      <NavBar />

      {/* Header */}
      <header className="border-b-2 border-ink bg-canvas-alt shadow-[0_4px_0_0_rgba(0,0,0,0.25)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => router.push("/dashboard")}
                className="p-2 border-2 border-ink bg-canvas hover:bg-canvas-alt transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] shrink-0"
                aria-label="Back to dashboard"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-0">
                {renaming ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") { setTitle(resume.title); setRenaming(false); }
                    }}
                    className="w-full bg-canvas border-2 border-ink px-3 py-1.5 text-base font-display text-ink outline-none shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-xl md:text-2xl font-display truncate cursor-pointer hover:bg-canvas px-2 -mx-2 py-1 transition-colors"
                    onClick={() => {
                      setRenaming(true);
                      setTimeout(() => titleInputRef.current?.select(), 0);
                    }}
                    title="Click to rename"
                  >
                    {resume.title}
                  </h1>
                )}
                <div className="flex items-center gap-2 mt-1.5 ml-2">
                  <StatusBadge status={resume.status} />
                  {isTailored && (
                    <span className="text-xs font-mono text-ink-soft border-2 border-ink px-2 py-0.5 bg-canvas shadow-[1px_1px_0_rgba(0,0,0,0.25)]">
                      TAILORED
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setEnrichOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <Sparkles size={15} /> Enhance Resume
              </button>
              <button onClick={() => router.push(`/builder?id=${resume.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <Edit size={15} /> Edit
              </button>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <Download size={15} /> Download
              </button>
              {deleteConfirm ? (
                <div className="flex items-center gap-1">
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-2 border-[#dc2626] bg-[#dc2626] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    Confirm Delete
                  </button>
                  <button onClick={() => setDeleteConfirm(false)}
                    className="p-2.5 border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-2 border-ink bg-canvas text-[#dc2626] hover:bg-[#dc2626] hover:text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all"
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Resume Preview */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[900px] bg-canvas-alt border-2 border-ink shadow-[8px_8px_0_rgba(0,0,0,0.25)] p-8 md:p-12 print:shadow-none print:border-ink"
          >
            {/* Title header within resume */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                {resume.title}
              </h1>
            </div>

            {visibleSections.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-ink-soft font-mono text-sm">
                  This resume is empty. It&apos;s giving &ldquo;minimalist&rdquo; a bit too much credit.
                </p>
                <button onClick={() => router.push(`/builder?id=${resume.id}`)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-3 text-sm font-mono border-2 border-ink bg-[#0284c7] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all"
                >
                  <Edit size={14} /> Add sections in Builder
                </button>
              </div>
            )}

            {visibleSections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
          </div>
        </div>
      </main>

      {/* Enrichment Modal */}
      {enrichOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEnrichOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-lg w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink">
              <h2 className="text-lg font-display font-bold">Enrich Resume</h2>
              <button onClick={() => setEnrichOpen(false)} className="p-2 border-2 border-ink bg-canvas hover:bg-[#dc2626] hover:text-white transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-mono text-ink-soft">
                The enrichment feature will analyze your resume against job descriptions and surface improvements.
                It&apos;s like having a recruiter friend who&apos;s brutally honest but ultimately helpful.
              </p>
              <div className="flex items-center gap-3 p-4 border-2 border-ink bg-canvas shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
                <Sparkles size={20} className="text-[#7c3aed] shrink-0" />
                <p className="text-xs font-mono text-ink-soft">
                  Enrichment sessions use AI to analyze your resume structure, suggest better bullet points,
                  and identify gaps. Results are saved and editable.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 px-5 py-3 text-sm font-mono border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all"
                  onClick={() => setEnrichOpen(false)}
                >
                  Start Enrichment
                </button>
                <button onClick={() => setEnrichOpen(false)}
                  className="px-5 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
