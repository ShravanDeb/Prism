"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Wand2, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase-client";

interface DiffItem {
  added: string[];
  changed: string[];
  removed: string[];
}

interface MasterResume {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  templateId: string;
  _type: "master";
}

export default function TailorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId");

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [masterResumes, setMasterResumes] = useState<MasterResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(resumeIdParam);
  const [fetchingResumes, setFetchingResumes] = useState(false);

  const [style, setStyle] = useState<"nudge" | "keywords" | "full">("full");
  const [jobDescription, setJobDescription] = useState("");
  const charCount = jobDescription.length;

  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [diffResult, setDiffResult] = useState<DiffItem | null>(null);
  const [tailoredResumeId, setTailoredResumeId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const supabase = createClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      setAuthLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!resumeIdParam) fetchMasterResumes();
  }, [authLoading, resumeIdParam]);

  useEffect(() => {
    if (submitting && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [submitting, startTime]);

  const fetchMasterResumes = async () => {
    setFetchingResumes(true);
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      const masters = (data.resumes || []).filter((r: any) => r._type === "master");
      setMasterResumes(masters);
      if (masters.length > 0 && !selectedResumeId) {
        setSelectedResumeId(masters[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch resumes", e);
    } finally {
      setFetchingResumes(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedResumeId || !jobDescription.trim()) return;

    setSubmitting(true);
    setStartTime(Date.now());
    setElapsed(0);
    setError("");
    setDiffResult(null);

    try {
      const res = await fetch(`/api/resumes/${selectedResumeId}/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, style }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setTailoredResumeId(data.id);
      setDiffResult(data.diff);
    } catch (e: any) {
      setError(e.message || "Failed to generate tailored resume");
    } finally {
      setSubmitting(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const handleRegenerate = () => {
    setDiffResult(null);
    setTailoredResumeId(null);
    handleSubmit();
  };

  const handleAccept = () => {
    if (tailoredResumeId) router.push(`/builder?id=${tailoredResumeId}`);
  };

  const handleReject = () => {
    setDiffResult(null);
    setTailoredResumeId(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans">
        <NavBar />
        <div className="pt-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <NavBar />
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display leading-tight tracking-tight">
            Tailor Your Resume
          </h1>
          <p className="text-ink-soft font-mono text-sm mt-2">
            Paste a job description. We'll rewrite your resume to match. Your future employer will never know. We won't tell.
          </p>
        </div>

        <div className="space-y-6">
          {!resumeIdParam && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-2">
                Master Resume
              </label>
              {fetchingResumes ? (
                <div className="flex items-center gap-2 text-ink-soft font-mono text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading resumes...
                </div>
              ) : masterResumes.length === 0 ? (
                <div className="border-2 border-ink border-dashed p-4 text-center">
                  <p className="text-sm text-ink-soft font-mono">
                    No master resumes found.{" "}
                    <button onClick={() => router.push("/dashboard")} className="underline text-ink hover:text-ink-soft">
                      Upload one first
                    </button>
                  </p>
                </div>
              ) : (
                <select
                  value={selectedResumeId || ""}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border-2 border-ink text-ink text-sm font-mono focus:shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none appearance-none"
                >
                  {masterResumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-2">
              Improvement Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as "nudge" | "keywords" | "full")}
              disabled={submitting}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink text-ink text-sm font-mono focus:shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none appearance-none disabled:opacity-50"
            >
              <option value="nudge">Nudge — minor tweaks</option>
              <option value="keywords">Keywords — keyword-focused</option>
              <option value="full">Full — complete rewrite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={submitting}
              placeholder="Paste the job description here..."
              rows={12}
              className="w-full px-4 py-3 bg-canvas border-2 border-ink text-ink text-sm font-mono focus:shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none placeholder:text-ink-soft resize-y min-h-[200px] disabled:opacity-50"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs font-mono text-ink-soft">{charCount.toLocaleString()} characters</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 border-2 border-[#dc2626] bg-[#dc2626]/10 text-sm text-[#dc2626] font-mono">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedResumeId || !jobDescription.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#7c3aed] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[5px_5px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Tailoring... ({formatTime(elapsed)})
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate Tailored Resume
              </>
            )}
          </button>
        </div>

        {submitting && (
          <div className="mt-6 text-center">
            <p className="text-xs font-mono text-ink-soft">
              Analyzing job description and rewriting your resume. This usually takes 10–30 seconds.
            </p>
          </div>
        )}
      </main>

      {diffResult && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={handleReject}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-8 max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-display mb-6">Diff Preview</h2>

            <div className="flex-1 overflow-y-auto space-y-6 mb-6">
              {diffResult.added.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#059669] mb-2">Added</h3>
                  <div className="space-y-1">
                    {diffResult.added.map((item, i) => (
                      <div key={i} className="px-3 py-2 border-2 border-[#059669] bg-[#059669]/10 text-sm font-mono text-ink">
                        + {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diffResult.changed.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#dc2626] mb-2">Changed</h3>
                  <div className="space-y-1">
                    {diffResult.changed.map((item, i) => (
                      <div key={i} className="px-3 py-2 border-2 border-[#dc2626] bg-[#dc2626]/10 text-sm font-mono text-ink">
                        ~ {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diffResult.removed.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#dc2626] mb-2">Removed</h3>
                  <div className="space-y-1">
                    {diffResult.removed.map((item, i) => (
                      <div key={i} className="px-3 py-2 border-2 border-[#dc2626] bg-[#dc2626]/10 text-sm font-mono text-ink line-through opacity-60">
                        - {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diffResult.added.length === 0 && diffResult.changed.length === 0 && diffResult.removed.length === 0 && (
                <p className="text-sm text-ink-soft font-mono text-center py-8">
                  No changes detected. The AI thinks your resume is already a perfect match.
                </p>
              )}
            </div>

            <div className="flex gap-3 border-t-2 border-ink pt-4">
              <button onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#059669] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <Check size={16} /> Accept
              </button>
              <button onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#dc2626] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <X size={16} /> Reject
              </button>
              <button onClick={handleRegenerate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <RefreshCw size={16} /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
