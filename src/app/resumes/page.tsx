"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";

interface Resume {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  templateId: string;
  _type: "master" | "tailored";
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        setResumes(data.resumes || []);
      } catch {
        console.error("Failed to fetch resumes");
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pt-16">
      <NavBar />
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display leading-tight tracking-tight">
            <s className="decoration-ink decoration-2">All</s>{" "}
            <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Resumes</span>.
          </h1>
          <p className="text-ink-soft font-mono text-sm mt-2">
            Every resume you&apos;ve ever made. Well, since you signed up.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Fetching your collection...
          </div>
        ) : resumes.length === 0 ? (
          <div className="border-2 border-ink bg-canvas-alt shadow-[8px_8px_0_rgba(0,0,0,0.25)] p-12 text-center">
            <FileText size={48} className="mx-auto text-ink-soft mb-4" />
            <p className="text-ink-soft font-mono text-sm">
              No resumes yet. The void is waiting.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/resumes/${r.id}`)}
                className="group border-2 border-ink bg-canvas-alt p-6 text-left shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 border-2 border-ink bg-canvas flex items-center justify-center group-hover:bg-[#7c3aed] group-hover:text-white transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-mono text-sm font-bold truncate">{r.title}</h3>
                    <p className="text-xs text-ink-soft font-mono">{r._type}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono px-2 py-0.5 border-2 ${
                    r.status === "ready"
                      ? "border-[#059669] text-[#059669] bg-[#059669]/10"
                      : "border-ink text-ink-soft bg-canvas"
                  }`}>
                    {r.status}
                  </span>
                  <span className="text-xs text-ink-soft font-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
