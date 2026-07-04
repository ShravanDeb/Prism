"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Upload, Wand2, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";

export default function DashboardPage() {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadOpen(false);
      router.push("/resume-wizard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <NavBar />
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display leading-tight tracking-tight">
            <s className="decoration-ink decoration-2">Manual</s>{" "}
            <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Smart</span>.
            {" "}Your workspace.
          </h1>
          <p className="text-ink-soft font-mono text-sm mt-2">
            Start by uploading your resume or building one from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <button onClick={() => setUploadOpen(true)}
            className="group border-2 border-ink border-dashed bg-canvas-alt p-8 flex flex-col items-center justify-center gap-4 shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all min-h-[200px]"
          >
            <div className="w-16 h-16 border-2 border-ink bg-canvas flex items-center justify-center group-hover:bg-[#7c3aed] group-hover:text-white transition-all shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
              <Plus size={32} />
            </div>
            <span className="text-sm font-mono uppercase tracking-wider text-ink-soft group-hover:text-ink transition-colors">
              Initialize Master Resume
            </span>
            <span className="text-xs text-ink-soft/60 text-center">Upload PDF, DOCX, or build from scratch</span>
          </button>

          <button onClick={() => router.push("/resume-wizard")}
            className="group border-2 border-ink bg-canvas-alt p-8 flex flex-col items-center justify-center gap-3 shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all min-h-[200px]"
          >
            <div className="w-14 h-14 border-2 border-ink bg-[#0284c7]/10 flex items-center justify-center group-hover:bg-[#0284c7] group-hover:text-white transition-all shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
              <Wand2 size={28} />
            </div>
            <span className="text-sm font-mono uppercase tracking-wider text-ink-soft group-hover:text-ink">Resume Wizard</span>
            <span className="text-xs text-ink-soft/60 text-center">Build with AI, one question at a time</span>
          </button>
        </div>

        <div className="mt-12 text-center py-20 border-2 border-ink border-dashed bg-canvas-alt">
          <div className="max-w-md mx-auto">
            <FileText size={48} className="mx-auto text-ink-soft/30 mb-4" />
            <h2 className="text-xl font-display text-ink mb-2">Nothing here. Yet.</h2>
            <p className="text-sm text-ink-soft mb-6 font-mono">
              Upload a resume or use the wizard to create one. Either way, it&apos;s better than staring at an empty grid.
            </p>
            <button onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#7c3aed] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
            >
              <Upload size={16} /> Upload Your Resume
            </button>
          </div>
        </div>
      </main>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !uploading && setUploadOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-lg w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-8">
            <h2 className="text-xl font-display mb-6">Upload Resume</h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
              className={`border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
                dragOver ? "border-[#7c3aed] bg-[#7c3aed]/5 shadow-[4px_4px_0_rgba(0,0,0,0.25)]" : "border-ink"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin text-[#7c3aed]" />
                  <p className="text-sm font-mono text-ink-soft">Parsing your resume...</p>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-ink-soft mb-4" />
                  <p className="text-sm font-mono text-ink-soft">Drop your resume here, or click to browse</p>
                  <p className="text-xs text-ink-soft/60 mt-2">PDF, DOCX, or image formats</p>
                </>
              )}
            </div>
            <input id="file-input" type="file" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />

            <div className="mt-4 flex gap-2">
              <button onClick={() => router.push("/resume-wizard")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#0284c7] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <Wand2 size={16} /> Use the Wizard Instead
              </button>
              <button onClick={() => setUploadOpen(false)} disabled={uploading}
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
