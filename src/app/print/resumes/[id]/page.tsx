"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  title: string;
  templateId: string;
  pageSize: string;
  accentColor: string;
  status: string;
  sections: ResumeSection[];
}

function formatDate(date: string | null) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ResumeSectionView({ section }: { section: ResumeSection }) {
  if (!section.visible) return null;

  if (section.type === "experience" && section.experienceEntries.length > 0) {
    return (
      <div className="mb-6">
        <h2 className="text-base font-display font-bold border-b border-black pb-1 mb-3 uppercase tracking-tight">
          {section.name || "Experience"}
        </h2>
        {section.experienceEntries.map((exp) => (
          <div key={exp.id} className="mb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-sm">{exp.title}</span>
                {exp.company && (
                  <span className="text-sm text-gray-600"> — {exp.company}</span>
                )}
              </div>
              {(exp.startDate || exp.endDate) && (
                <span className="text-xs text-gray-500 shrink-0">
                  {formatDate(exp.startDate) || "—"} – {exp.current ? "Present" : formatDate(exp.endDate) || "—"}
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              )}
            </div>
            {exp.bullets.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-1.5">
                    <span className="select-none shrink-0">–</span>
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
      <div className="mb-6">
        <h2 className="text-base font-display font-bold border-b border-black pb-1 mb-3 uppercase tracking-tight">
          {section.name || "Education"}
        </h2>
        {section.educationEntries.map((edu) => (
          <div key={edu.id} className="mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-sm">{edu.institution}</span>
                {edu.degree && <span className="text-sm text-gray-600"> — {edu.degree}</span>}
                {edu.field && <span className="text-sm text-gray-600">, {edu.field}</span>}
              </div>
              {(edu.startDate || edu.endDate) && (
                <span className="text-xs text-gray-500 shrink-0">
                  {formatDate(edu.startDate) || "—"} – {formatDate(edu.endDate) || "Present"}
                </span>
              )}
            </div>
            {edu.gpa && <p className="text-xs text-gray-500 mt-0.5">GPA: {edu.gpa}</p>}
            {edu.bullets.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {edu.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-1.5">
                    <span className="select-none shrink-0">–</span>
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
      <div className="mb-6">
        <h2 className="text-base font-display font-bold border-b border-black pb-1 mb-3 uppercase tracking-tight">
          {section.name || "Projects"}
        </h2>
        {section.projectEntries.map((proj) => (
          <div key={proj.id} className="mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-sm">{proj.name}</span>
                {proj.url && (
                  <span className="text-xs text-gray-500 ml-1">— {proj.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                )}
              </div>
              {(proj.startDate || proj.endDate) && (
                <span className="text-xs text-gray-500 shrink-0">
                  {formatDate(proj.startDate) || "—"} – {formatDate(proj.endDate) || "Present"}
                </span>
              )}
            </div>
            {proj.description && <p className="text-sm text-gray-600 mt-0.5">{proj.description}</p>}
            {proj.bullets.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {proj.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-1.5">
                    <span className="select-none shrink-0">–</span>
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
      <div className="mb-6">
        <h2 className="text-base font-display font-bold border-b border-black pb-1 mb-3 uppercase tracking-tight">
          {section.name || "Additional"}
        </h2>
        {section.customEntries.map((entry) => (
          <div key={entry.id} className="mb-2">
            {entry.content && <p className="text-sm mb-1">{entry.content}</p>}
            {entry.bullets.length > 0 && (
              <ul className="space-y-0.5">
                {entry.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-1.5">
                    <span className="select-none shrink-0">–</span>
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

export default function PrintResumePage() {
  const params = useParams();
  const id = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) throw new Error("Failed to load resume");
        const data = await res.json();
        setResume(data.resume);
      } catch (e: any) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!loading && resume) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, resume]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading resume...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <p className="text-sm text-gray-500">{error || "Resume not found"}</p>
      </div>
    );
  }

  const visibleSections = resume.sections.filter((s) => s.visible);

  return (
    <div className="print-container">
      <div className="print-content">
        <div className="print-header">
          <span className="print-watermark">PRISM</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {resume.title}
          </h1>
        </div>

        {visibleSections.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No visible sections</p>
        )}

        {visibleSections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <ResumeSectionView key={section.id} section={section} />
          ))}
      </div>

      <style>{`
        @media print {
          @page { margin: 0.5in; size: ${resume.pageSize || "A4"}; }
          body { background: white !important; margin: 0; padding: 0; }
          .print-container { display: block !important; }
          .print-content { max-width: 100% !important; }
          .print-header { display: none; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media screen {
          body { background: #f0f0e8; margin: 0; padding: 24px; }
          .print-container {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
          }
          .print-content {
            max-width: 816px;
            width: 100%;
            background: white;
            padding: 48px 56px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.1);
          }
          .print-header {
            text-align: right;
            margin-bottom: 8px;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #999;
            font-family: var(--font-mono, monospace);
          }
        }
      `}</style>
    </div>
  );
}
