"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Save,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase-client";
import type { ResumeData as TemplateResumeData } from "@/components/templates/resume-types";
import Classic from "@/components/templates/classic";
import Modern from "@/components/templates/modern";
import Minimal from "@/components/templates/minimal";
import Executive from "@/components/templates/executive";
import Creative from "@/components/templates/creative";
import Technical from "@/components/templates/technical";

const TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
  { id: "executive", label: "Executive" },
  { id: "creative", label: "Creative" },
  { id: "technical", label: "Technical" },
];

interface LinkItem {
  id: string;
  label: string;
  url: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  bullets: string[];
}

interface SkillCategory {
  id: string;
  category: string;
  items: string;
}

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  urls: LinkItem[];
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface CustomSection {
  id: string;
  name: string;
  bullets: string[];
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: LinkItem[];
}

interface ResumeEditorData {
  id: string;
  title: string;
  templateId: string;
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  skills: SkillCategory[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  customSections: CustomSection[];
}

interface AiSuggestion {
  sectionType: string;
  entryId: string;
  field: string;
  original: string;
  suggested: string;
  reason: string;
}

const EMPTY_PERSONAL: PersonalInfo = {
  name: "",
  email: "",
  phone: "",
  location: "",
  links: [],
};

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);

  const [resume, setResume] = useState<ResumeEditorData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([
      "personalInfo",
      "education",
      "skills",
      "experience",
      "projects",
      "customSections",
    ])
  );
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [modalContent, setModalContent] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (!id) {
        router.push("/dashboard");
        return;
      }
      await fetchResume(id);
    };
    init();
  }, [id]);

  const fetchResume = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      const data = await res.json();
      if (!data.resume) {
        router.push("/dashboard");
        return;
      }
      const r = data.resume;
      const sections = r.sections || [];
      const piSection = sections.find(
        (s: any) => s.type === "personal_info"
      );
      const piEntry = piSection?.customEntries?.[0] || piSection?.entries?.[0];
      const piParsed: Record<string, any> = (() => {
        if (!piEntry?.content) return {};
        try {
          return JSON.parse(piEntry.content);
        } catch {
          return {};
        }
      })();

      const links: LinkItem[] = (piParsed.links || []).map(
        (l: any, i: number) => ({
          id: `link-${i}`,
          label: l.label || "",
          url: l.url || "",
        })
      );

      const educationEntries: EducationEntry[] = [];
      const expEntries: ExperienceEntry[] = [];
      const projEntries: ProjectEntry[] = [];
      const customSecs: CustomSection[] = [];
      let skillCats: SkillCategory[] = [];

      for (const s of sections) {
        if (s.type === "education") {
          (s.educationEntries || s.entries || []).forEach((e: any) =>
            educationEntries.push({
              id: e.id || crypto.randomUUID(),
              institution: e.institution || "",
              degree: e.degree || "",
              field: e.field || "",
              startDate: e.startDate || "",
              endDate: e.endDate || "",
              gpa: e.gpa || "",
              bullets: e.bullets || [],
            })
          );
        } else if (s.type === "experience") {
          (s.experienceEntries || s.entries || []).forEach((e: any) =>
            expEntries.push({
              id: e.id || crypto.randomUUID(),
              title: e.title || "",
              company: e.company || "",
              location: e.location || "",
              startDate: e.startDate || "",
              endDate: e.endDate || "",
              current: e.current || false,
              bullets: e.bullets || [],
            })
          );
        } else if (s.type === "projects") {
          (s.projectEntries || s.entries || []).forEach((e: any) =>
            projEntries.push({
              id: e.id || crypto.randomUUID(),
              name: e.name || "",
              description: e.description || "",
              urls: (e.urls || (e.url ? [{ label: "Link", url: e.url }] : [])).map(
                (u: any, i: number) => ({
                  id: `url-${i}`,
                  label: u.label || "",
                  url: u.url || "",
                })
              ),
              startDate: e.startDate || "",
              endDate: e.endDate || "",
              bullets: e.bullets || [],
            })
          );
        } else if (s.type === "skills") {
          const parsed = (() => {
            try {
              return JSON.parse(s.customEntries?.[0]?.content || "[]");
            } catch {
              return [];
            }
          })();
          skillCats = parsed.map((cat: any, i: number) => ({
            id: `skill-${i}`,
            category: cat.category || "",
            items: (cat.items || []).join(", "),
          }));
        } else if (
          s.type === "additional" ||
          s.type === "custom"
        ) {
          (s.customEntries || s.entries || []).forEach((e: any) =>
            customSecs.push({
              id: e.id || crypto.randomUUID(),
              name: e.name || s.name || "Custom Section",
              bullets: e.bullets || [],
            })
          );
        }
      }

      setResume({
        id: r.id,
        title: r.title || "Untitled",
        templateId: r.templateId || "classic",
        personalInfo: {
          name: piParsed.name || "",
          email: piParsed.email || "",
          phone: piParsed.phone || "",
          location: piParsed.location || "",
          links,
        },
        education: educationEntries,
        skills: skillCats,
        experience: expEntries,
        projects: projEntries,
        customSections: customSecs,
      });
    } catch (e) {
      console.error("Failed to fetch resume", e);
      showToast("Failed to load resume", "error");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateField = useCallback(
    <K extends keyof ResumeEditorData>(key: K, value: ResumeEditorData[K]) => {
      setResume((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    []
  );

  const updatePersonal = useCallback(
    (field: keyof PersonalInfo, value: any) => {
      setResume((prev) =>
        prev
          ? {
              ...prev,
              personalInfo: { ...prev.personalInfo, [field]: value },
            }
          : prev
      );
    },
    []
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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
      const piContent = JSON.stringify({
        name: resume.personalInfo.name,
        email: resume.personalInfo.email,
        phone: resume.personalInfo.phone,
        location: resume.personalInfo.location,
        links: resume.personalInfo.links.map((l) => ({
          label: l.label,
          url: l.url,
        })),
      });

      const sections: any[] = [
        {
          type: "personal_info",
          order: 0,
          visible: true,
          name: "Personal Info",
          entries: [
            {
              order: 0,
              type: "personal_info",
              content: piContent,
              bullets: [],
            },
          ],
        },
        ...resume.education.map((edu, i) => ({
          type: "education",
          order: i + 1,
          visible: true,
          name: "Education",
          entries: [
            {
              order: 0,
              type: "education",
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field,
              startDate: edu.startDate,
              endDate: edu.endDate,
              gpa: edu.gpa,
              bullets: edu.bullets,
            },
          ],
        })),
        ...(resume.skills.length > 0
          ? [
              {
                type: "skills",
                order: resume.education.length + 1,
                visible: true,
                name: "Skills",
                customEntries: [
                  {
                    order: 0,
                    content: JSON.stringify(
                      resume.skills.map((s) => ({
                        category: s.category,
                        items: s.items
                          .split(",")
                          .map((i: string) => i.trim())
                          .filter(Boolean),
                      }))
                    ),
                    bullets: [],
                  },
                ],
              },
            ]
          : []),
        ...resume.experience.map((exp, i) => ({
          type: "experience",
          order: resume.education.length + resume.skills.length + i + 1,
          visible: true,
          name: "Experience",
          entries: [
            {
              order: 0,
              type: "experience",
              title: exp.title,
              company: exp.company,
              location: exp.location,
              startDate: exp.startDate,
              endDate: exp.endDate,
              current: exp.current,
              bullets: exp.bullets,
            },
          ],
        })),
        ...resume.projects.map((proj, i) => ({
          type: "projects",
          order:
            resume.education.length +
            resume.skills.length +
            resume.experience.length +
            i +
            1,
          visible: true,
          name: "Projects",
          entries: [
            {
              order: 0,
              type: "projects",
              name: proj.name,
              description: proj.description,
              url: proj.urls[0]?.url || "",
              urls: proj.urls.map((u) => ({ label: u.label, url: u.url })),
              startDate: proj.startDate,
              endDate: proj.endDate,
              bullets: proj.bullets,
            },
          ],
        })),
        ...resume.customSections.map((cs, i) => ({
          type: "additional",
          order:
            resume.education.length +
            resume.skills.length +
            resume.experience.length +
            resume.projects.length +
            i +
            1,
          visible: true,
          name: cs.name,
          customEntries: [
            {
              order: 0,
              name: cs.name,
              bullets: cs.bullets,
            },
          ],
        })),
      ];

      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: resume.personalInfo,
          sections,
          templateId: resume.templateId,
        }),
      });

      if (res.ok) {
        showToast("Resume saved", "success");
      } else {
        throw new Error("Save failed");
      }
    } catch (e) {
      console.error("Save failed", e);
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resume }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        setShowSuggestions(true);
        showToast(`${data.suggestions.length} suggestions found`, "success");
      }
    } catch (e) {
      console.error("Analysis failed", e);
      showToast("AI analysis failed", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: AiSuggestion) => {
    if (!resume) return;
    const { sectionType, field, suggested } = suggestion;

    if (sectionType === "personal_info") {
      updatePersonal(field as keyof PersonalInfo, suggested);
    } else if (sectionType === "experience") {
      setResume((prev) =>
        prev
          ? {
              ...prev,
              experience: prev.experience.map((e) =>
                e.id === suggestion.entryId
                  ? { ...e, [field]: suggested }
                  : e
              ),
            }
          : prev
      );
    } else if (sectionType === "education") {
      setResume((prev) =>
        prev
          ? {
              ...prev,
              education: prev.education.map((e) =>
                e.id === suggestion.entryId
                  ? { ...e, [field]: suggested }
                  : e
              ),
            }
          : prev
      );
    } else if (sectionType === "projects") {
      setResume((prev) =>
        prev
          ? {
              ...prev,
              projects: prev.projects.map((e) =>
                e.id === suggestion.entryId
                  ? { ...e, [field]: suggested }
                  : e
              ),
            }
          : prev
      );
    }

    setAiSuggestions((prev) =>
      prev.filter(
        (s) =>
          !(
            s.sectionType === sectionType &&
            s.entryId === suggestion.entryId &&
            s.field === field
          )
      )
    );
  };

  const rejectSuggestion = (suggestion: AiSuggestion) => {
    setAiSuggestions((prev) =>
      prev.filter(
        (s) =>
          !(
            s.sectionType === suggestion.sectionType &&
            s.entryId === suggestion.entryId &&
            s.field === suggestion.field
          )
      )
    );
  };

  const handleGenerateCoverLetter = async () => {
    if (!resume) return;
    setGeneratingCover(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resume }),
      });
      const data = await res.json();
      if (data.coverLetter || data.content) {
        setModalTitle("Generated Cover Letter");
        setModalContent(data.coverLetter || data.content);
      }
    } catch (e) {
      console.error("Cover letter generation failed", e);
      showToast("Failed to generate cover letter", "error");
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!resume) return;
    setGeneratingOutreach(true);
    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resume, type: "linkedin" }),
      });
      const data = await res.json();
      if (data.outreach || data.content) {
        setModalTitle("Generated Outreach Message");
        setModalContent(data.outreach || data.content);
      }
    } catch (e) {
      console.error("Outreach generation failed", e);
      showToast("Failed to generate outreach message", "error");
    } finally {
      setGeneratingOutreach(false);
    }
  };

  const buildTemplateData = (): TemplateResumeData | null => {
    if (!resume) return null;
    return {
      personalInfo: {
        name: resume.personalInfo.name,
        email: resume.personalInfo.email,
        phone: resume.personalInfo.phone,
        location: resume.personalInfo.location,
        links: resume.personalInfo.links.map((l) => ({
          label: l.label,
          url: l.url,
        })),
      },
      education: resume.education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        field: e.field,
        startDate: e.startDate,
        endDate: e.endDate,
        gpa: e.gpa,
        bullets: e.bullets,
      })),
      experience: resume.experience.map((e) => ({
        title: e.title,
        company: e.company,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        bullets: e.bullets,
      })),
      skills: resume.skills.map((s) => ({
        category: s.category,
        items: s.items
          .split(",")
          .map((i: string) => i.trim())
          .filter(Boolean),
      })),
      projects: resume.projects.map((p) => ({
        name: p.name,
        urls: p.urls.map((u) => ({ label: u.label, url: u.url })),
        bullets: p.bullets,
      })),
      customSections: resume.customSections.map((cs) => ({
        name: cs.name,
        bullets: cs.bullets,
      })),
    };
  };

  const renderPreview = () => {
    const templateData = buildTemplateData();
    if (!templateData) return null;

    const props = { data: templateData };

    switch (resume?.templateId) {
      case "modern":
        return <Modern {...props} />;
      case "minimal":
        return <Minimal {...props} />;
      case "executive":
        return <Executive {...props} />;
      case "creative":
        return <Creative {...props} />;
      case "technical":
        return <Technical {...props} />;
      default:
        return <Classic {...props} />;
    }
  };

  if (loading || !resume) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans pt-16">
        <NavBar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Loading editor...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <NavBar />
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 text-sm font-mono border-2 border-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-all ${
            toast.type === "success"
              ? "bg-green-100 text-green-900"
              : "bg-red-100 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="pt-16 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Form */}
          <div className="w-1/2 min-w-[380px] border-r-2 border-ink overflow-y-auto bg-canvas-alt">
            <div className="p-4 space-y-1">
              {/* Template Selector */}
              <div className="border-2 border-ink bg-canvas p-3 mb-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Template
                </div>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateField("templateId", t.id)}
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
              </div>

              {/* Personal Info Section */}
              <CollapsibleSection
                title="Personal Info"
                expanded={expandedSections.has("personalInfo")}
                onToggle={() => toggleSection("personalInfo")}
                count={1}
              >
                <div className="space-y-1.5">
                  <input
                    value={resume.personalInfo.name}
                    onChange={(e) => updatePersonal("name", e.target.value)}
                    className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                    placeholder="Full Name"
                  />
                  <div className="flex gap-1.5">
                    <input
                      value={resume.personalInfo.email}
                      onChange={(e) =>
                        updatePersonal("email", e.target.value)
                      }
                      className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                      placeholder="Email"
                    />
                    <input
                      value={resume.personalInfo.phone}
                      onChange={(e) =>
                        updatePersonal("phone", e.target.value)
                      }
                      className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                      placeholder="Phone"
                    />
                  </div>
                  <input
                    value={resume.personalInfo.location}
                    onChange={(e) =>
                      updatePersonal("location", e.target.value)
                    }
                    className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                    placeholder="Location"
                  />
                  <div className="space-y-1">
                    {resume.personalInfo.links.map((link) => (
                      <div key={link.id} className="flex gap-1">
                        <input
                          value={link.label}
                          onChange={(e) => {
                            const links = resume.personalInfo.links.map(
                              (l) =>
                                l.id === link.id
                                  ? { ...l, label: e.target.value }
                                  : l
                            );
                            updatePersonal("links", links);
                          }}
                          className="w-1/3 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Label"
                        />
                        <input
                          value={link.url}
                          onChange={(e) => {
                            const links = resume.personalInfo.links.map(
                              (l) =>
                                l.id === link.id
                                  ? { ...l, url: e.target.value }
                                  : l
                            );
                            updatePersonal("links", links);
                          }}
                          className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="URL"
                        />
                        <button
                          onClick={() => {
                            const links =
                              resume.personalInfo.links.filter(
                                (l) => l.id !== link.id
                              );
                            updatePersonal("links", links);
                          }}
                          className="p-1 text-ink-soft hover:text-[#dc2626]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const links = [
                          ...resume.personalInfo.links,
                          {
                            id: crypto.randomUUID(),
                            label: "",
                            url: "",
                          },
                        ];
                        updatePersonal("links", links);
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink"
                    >
                      <Plus size={12} /> Add link
                    </button>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Education Section */}
              <CollapsibleSection
                title="Education"
                expanded={expandedSections.has("education")}
                onToggle={() => toggleSection("education")}
                count={resume.education.length}
              >
                <div className="space-y-1.5">
                  {resume.education.map((edu) => (
                    <CollapsibleEntry
                      key={edu.id}
                      label={
                        edu.institution || edu.degree || "New Education"
                      }
                      expanded={expandedEntries.has(edu.id)}
                      onToggle={() => toggleEntry(edu.id)}
                      onDelete={() =>
                        updateField(
                          "education",
                          resume.education.filter(
                            (e) => e.id !== edu.id
                          )
                        )
                      }
                    >
                      <div className="space-y-1.5">
                        <input
                          value={edu.institution}
                          onChange={(e) =>
                            updateField(
                              "education",
                              resume.education.map((ed) =>
                                ed.id === edu.id
                                  ? { ...ed, institution: e.target.value }
                                  : ed
                              )
                            )
                          }
                          className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Institution"
                        />
                        <div className="flex gap-1.5">
                          <input
                            value={edu.degree}
                            onChange={(e) =>
                              updateField(
                                "education",
                                resume.education.map((ed) =>
                                  ed.id === edu.id
                                    ? { ...ed, degree: e.target.value }
                                    : ed
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Degree"
                          />
                          <input
                            value={edu.field}
                            onChange={(e) =>
                              updateField(
                                "education",
                                resume.education.map((ed) =>
                                  ed.id === edu.id
                                    ? { ...ed, field: e.target.value }
                                    : ed
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Field"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            value={edu.startDate}
                            onChange={(e) =>
                              updateField(
                                "education",
                                resume.education.map((ed) =>
                                  ed.id === edu.id
                                    ? {
                                        ...ed,
                                        startDate: e.target.value,
                                      }
                                    : ed
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Start Date"
                          />
                          <input
                            value={edu.endDate}
                            onChange={(e) =>
                              updateField(
                                "education",
                                resume.education.map((ed) =>
                                  ed.id === edu.id
                                    ? { ...ed, endDate: e.target.value }
                                    : ed
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="End Date"
                          />
                          <input
                            value={edu.gpa}
                            onChange={(e) =>
                              updateField(
                                "education",
                                resume.education.map((ed) =>
                                  ed.id === edu.id
                                    ? { ...ed, gpa: e.target.value }
                                    : ed
                                )
                              )
                            }
                            className="w-20 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="GPA"
                          />
                        </div>
                        <BulletsEditor
                          bullets={edu.bullets}
                          onChange={(bullets) =>
                            updateField(
                              "education",
                              resume.education.map((ed) =>
                                ed.id === edu.id
                                  ? { ...ed, bullets }
                                  : ed
                              )
                            )
                          }
                        />
                      </div>
                    </CollapsibleEntry>
                  ))}
                  <button
                    onClick={() =>
                      updateField("education", [
                        ...resume.education,
                        {
                          id: crypto.randomUUID(),
                          institution: "",
                          degree: "",
                          field: "",
                          startDate: "",
                          endDate: "",
                          gpa: "",
                          bullets: [],
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink"
                  >
                    <Plus size={12} /> Add education
                  </button>
                </div>
              </CollapsibleSection>

              {/* Skills Section */}
              <CollapsibleSection
                title="Skills"
                expanded={expandedSections.has("skills")}
                onToggle={() => toggleSection("skills")}
                count={resume.skills.length}
              >
                <div className="space-y-1.5">
                  {resume.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="border border-ink/30 bg-canvas-alt p-2 space-y-1"
                    >
                      <div className="flex gap-1">
                        <input
                          value={skill.category}
                          onChange={(e) =>
                            updateField(
                              "skills",
                              resume.skills.map((s) =>
                                s.id === skill.id
                                  ? { ...s, category: e.target.value }
                                  : s
                              )
                            )
                          }
                          className="w-1/3 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Category"
                        />
                        <input
                          value={skill.items}
                          onChange={(e) =>
                            updateField(
                              "skills",
                              resume.skills.map((s) =>
                                s.id === skill.id
                                  ? { ...s, items: e.target.value }
                                  : s
                              )
                            )
                          }
                          className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Items (comma-separated)"
                        />
                        <button
                          onClick={() =>
                            updateField(
                              "skills",
                              resume.skills.filter(
                                (s) => s.id !== skill.id
                              )
                            )
                          }
                          className="p-1 text-ink-soft hover:text-[#dc2626]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      updateField("skills", [
                        ...resume.skills,
                        {
                          id: crypto.randomUUID(),
                          category: "",
                          items: "",
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink"
                  >
                    <Plus size={12} /> Add skill category
                  </button>
                </div>
              </CollapsibleSection>

              {/* Experience Section */}
              <CollapsibleSection
                title="Experience"
                expanded={expandedSections.has("experience")}
                onToggle={() => toggleSection("experience")}
                count={resume.experience.length}
              >
                <div className="space-y-1.5">
                  {resume.experience.map((exp) => (
                    <CollapsibleEntry
                      key={exp.id}
                      label={
                        exp.title || exp.company || "New Experience"
                      }
                      expanded={expandedEntries.has(exp.id)}
                      onToggle={() => toggleEntry(exp.id)}
                      onDelete={() =>
                        updateField(
                          "experience",
                          resume.experience.filter(
                            (e) => e.id !== exp.id
                          )
                        )
                      }
                    >
                      <div className="space-y-1.5">
                        <input
                          value={exp.title}
                          onChange={(e) =>
                            updateField(
                              "experience",
                              resume.experience.map((ex) =>
                                ex.id === exp.id
                                  ? { ...ex, title: e.target.value }
                                  : ex
                              )
                            )
                          }
                          className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Job Title"
                        />
                        <div className="flex gap-1.5">
                          <input
                            value={exp.company}
                            onChange={(e) =>
                              updateField(
                                "experience",
                                resume.experience.map((ex) =>
                                  ex.id === exp.id
                                    ? { ...ex, company: e.target.value }
                                    : ex
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Company"
                          />
                          <input
                            value={exp.location}
                            onChange={(e) =>
                              updateField(
                                "experience",
                                resume.experience.map((ex) =>
                                  ex.id === exp.id
                                    ? { ...ex, location: e.target.value }
                                    : ex
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Location"
                          />
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <input
                            value={exp.startDate}
                            onChange={(e) =>
                              updateField(
                                "experience",
                                resume.experience.map((ex) =>
                                  ex.id === exp.id
                                    ? {
                                        ...ex,
                                        startDate: e.target.value,
                                      }
                                    : ex
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Start Date"
                          />
                          <input
                            value={exp.endDate}
                            onChange={(e) =>
                              updateField(
                                "experience",
                                resume.experience.map((ex) =>
                                  ex.id === exp.id
                                    ? { ...ex, endDate: e.target.value }
                                    : ex
                                )
                              )
                            }
                            disabled={exp.current}
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono disabled:opacity-40"
                            placeholder="End Date"
                          />
                          <label className="flex items-center gap-1 text-[11px] font-mono text-ink-soft whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) =>
                                updateField(
                                  "experience",
                                  resume.experience.map((ex) =>
                                    ex.id === exp.id
                                      ? {
                                          ...ex,
                                          current: e.target.checked,
                                        }
                                      : ex
                                  )
                                )
                              }
                              className="border-2 border-ink"
                            />
                            Current
                          </label>
                        </div>
                        <BulletsEditor
                          bullets={exp.bullets}
                          onChange={(bullets) =>
                            updateField(
                              "experience",
                              resume.experience.map((ex) =>
                                ex.id === exp.id
                                  ? { ...ex, bullets }
                                  : ex
                              )
                            )
                          }
                        />
                      </div>
                    </CollapsibleEntry>
                  ))}
                  <button
                    onClick={() =>
                      updateField("experience", [
                        ...resume.experience,
                        {
                          id: crypto.randomUUID(),
                          title: "",
                          company: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                          current: false,
                          bullets: [],
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink"
                  >
                    <Plus size={12} /> Add experience
                  </button>
                </div>
              </CollapsibleSection>

              {/* Projects Section */}
              <CollapsibleSection
                title="Projects"
                expanded={expandedSections.has("projects")}
                onToggle={() => toggleSection("projects")}
                count={resume.projects.length}
              >
                <div className="space-y-1.5">
                  {resume.projects.map((proj) => (
                    <CollapsibleEntry
                      key={proj.id}
                      label={proj.name || "New Project"}
                      expanded={expandedEntries.has(proj.id)}
                      onToggle={() => toggleEntry(proj.id)}
                      onDelete={() =>
                        updateField(
                          "projects",
                          resume.projects.filter(
                            (p) => p.id !== proj.id
                          )
                        )
                      }
                    >
                      <div className="space-y-1.5">
                        <input
                          value={proj.name}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              resume.projects.map((p) =>
                                p.id === proj.id
                                  ? { ...p, name: e.target.value }
                                  : p
                              )
                            )
                          }
                          className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Project Name"
                        />
                        <textarea
                          value={proj.description}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              resume.projects.map((p) =>
                                p.id === proj.id
                                  ? {
                                      ...p,
                                      description: e.target.value,
                                    }
                                  : p
                              )
                            )
                          }
                          className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono resize-none h-14"
                          placeholder="Description"
                        />
                        <div className="space-y-1">
                          {proj.urls.map((url) => (
                            <div key={url.id} className="flex gap-1">
                              <input
                                value={url.label}
                                onChange={(e) => {
                                  const urls = proj.urls.map(
                                    (u) =>
                                      u.id === url.id
                                        ? {
                                            ...u,
                                            label: e.target.value,
                                          }
                                        : u
                                  );
                                  updateField(
                                    "projects",
                                    resume.projects.map((p) =>
                                      p.id === proj.id
                                        ? { ...p, urls }
                                        : p
                                    )
                                  );
                                }}
                                className="w-1/4 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                                placeholder="Label"
                              />
                              <input
                                value={url.url}
                                onChange={(e) => {
                                  const urls = proj.urls.map(
                                    (u) =>
                                      u.id === url.id
                                        ? {
                                            ...u,
                                            url: e.target.value,
                                          }
                                        : u
                                  );
                                  updateField(
                                    "projects",
                                    resume.projects.map((p) =>
                                      p.id === proj.id
                                        ? { ...p, urls }
                                        : p
                                    )
                                  );
                                }}
                                className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                                placeholder="URL"
                              />
                              <button
                                onClick={() => {
                                  const urls = proj.urls.filter(
                                    (u) => u.id !== url.id
                                  );
                                  updateField(
                                    "projects",
                                    resume.projects.map((p) =>
                                      p.id === proj.id
                                        ? { ...p, urls }
                                        : p
                                    )
                                  );
                                }}
                                className="p-1 text-ink-soft hover:text-[#dc2626]"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const urls = [
                                ...proj.urls,
                                {
                                  id: crypto.randomUUID(),
                                  label: "",
                                  url: "",
                                },
                              ];
                              updateField(
                                "projects",
                                resume.projects.map((p) =>
                                  p.id === proj.id
                                    ? { ...p, urls }
                                    : p
                                )
                              );
                            }}
                            className="flex items-center gap-1 text-[10px] font-mono text-ink-soft hover:text-ink"
                          >
                            <Plus size={10} /> Add URL
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            value={proj.startDate}
                            onChange={(e) =>
                              updateField(
                                "projects",
                                resume.projects.map((p) =>
                                  p.id === proj.id
                                    ? {
                                        ...p,
                                        startDate: e.target.value,
                                      }
                                    : p
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="Start Date"
                          />
                          <input
                            value={proj.endDate}
                            onChange={(e) =>
                              updateField(
                                "projects",
                                resume.projects.map((p) =>
                                  p.id === proj.id
                                    ? { ...p, endDate: e.target.value }
                                    : p
                                )
                              )
                            }
                            className="flex-1 bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                            placeholder="End Date"
                          />
                        </div>
                        <BulletsEditor
                          bullets={proj.bullets}
                          onChange={(bullets) =>
                            updateField(
                              "projects",
                              resume.projects.map((p) =>
                                p.id === proj.id
                                  ? { ...p, bullets }
                                  : p
                              )
                            )
                          }
                        />
                      </div>
                    </CollapsibleEntry>
                  ))}
                  <button
                    onClick={() =>
                      updateField("projects", [
                        ...resume.projects,
                        {
                          id: crypto.randomUUID(),
                          name: "",
                          description: "",
                          urls: [],
                          startDate: "",
                          endDate: "",
                          bullets: [],
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink"
                  >
                    <Plus size={12} /> Add project
                  </button>
                </div>
              </CollapsibleSection>

              {/* Custom Sections */}
              <CollapsibleSection
                title="Custom Sections"
                expanded={expandedSections.has("customSections")}
                onToggle={() => toggleSection("customSections")}
                count={resume.customSections.length}
              >
                <div className="space-y-1.5">
                  {resume.customSections.map((cs) => (
                    <CollapsibleEntry
                      key={cs.id}
                      label={cs.name || "New Section"}
                      expanded={expandedEntries.has(cs.id)}
                      onToggle={() => toggleEntry(cs.id)}
                      onDelete={() =>
                        updateField(
                          "customSections",
                          resume.customSections.filter(
                            (c) => c.id !== cs.id
                          )
                        )
                      }
                    >
                      <div className="space-y-1.5">
                        <input
                          value={cs.name}
                          onChange={(e) =>
                            updateField(
                              "customSections",
                              resume.customSections.map((c) =>
                                c.id === cs.id
                                  ? { ...c, name: e.target.value }
                                  : c
                              )
                            )
                          }
                          className="w-full bg-canvas border-2 border-ink px-2 py-1 text-ink outline-none text-[11px] font-mono"
                          placeholder="Section Name"
                        />
                        <BulletsEditor
                          bullets={cs.bullets}
                          onChange={(bullets) =>
                            updateField(
                              "customSections",
                              resume.customSections.map((c) =>
                                c.id === cs.id
                                  ? { ...c, bullets }
                                  : c
                              )
                            )
                          }
                        />
                      </div>
                    </CollapsibleEntry>
                  ))}
                  <button
                    onClick={() =>
                      updateField("customSections", [
                        ...resume.customSections,
                        {
                          id: crypto.randomUUID(),
                          name: "",
                          bullets: [],
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-mono text-ink-soft hover:text-ink"
                  >
                    <Plus size={12} /> Add custom section
                  </button>
                </div>
              </CollapsibleSection>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-y-auto bg-canvas p-6">
            <div id="preview-content" className="flex justify-center">
              <div className="border-2 border-ink shadow-[4px_4px_0_rgba(0,0,0,0.25)] bg-white max-w-[800px] w-full">
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="border-t-2 border-ink bg-canvas-alt p-4 max-h-[35vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                AI Suggestions
              </h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-ink-soft hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-2">
              {aiSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="border-2 border-ink bg-canvas p-3 shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-1">
                        {s.sectionType} &middot; {s.field}
                      </div>
                      <div className="text-xs font-mono mb-1">
                        <span className="text-ink-soft line-through">
                          {s.original || "(empty)"}
                        </span>
                        <span className="mx-1">&rarr;</span>
                        <span className="text-ink font-medium">
                          {s.suggested}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-ink-soft italic">
                        {s.reason}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => applySuggestion(s)}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-ink bg-green-500 text-white shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectSuggestion(s)}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-ink bg-canvas text-ink-soft shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Bottom Bar */}
        <div className="border-t-2 border-ink bg-canvas-alt px-6 py-3 flex items-center justify-between gap-4 shrink-0">
          <div className="text-sm font-mono text-ink-soft truncate">
            {resume.title}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono font-bold uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono font-bold uppercase tracking-wider border-2 border-ink bg-[#7c3aed] text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
            >
              {analyzing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Analyze with AI
            </button>
            <button
              onClick={handleGenerateCoverLetter}
              disabled={generatingCover}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono font-bold uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
            >
              {generatingCover ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Generate Cover Letter
            </button>
            <button
              onClick={handleGenerateOutreach}
              disabled={generatingOutreach}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-mono font-bold uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40"
            >
              {generatingOutreach ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Generate Outreach
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Generated Content */}
      {modalContent && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setModalContent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full max-h-[80vh] bg-canvas-alt border-2 border-ink shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display">{modalTitle}</h2>
              <button
                onClick={() => setModalContent(null)}
                className="p-1 text-ink-soft hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <pre className="text-sm font-sans text-ink whitespace-pre-wrap leading-relaxed">
                {modalContent}
              </pre>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t-2 border-ink">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(modalContent);
                  showToast("Copied to clipboard", "success");
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                Copy
              </button>
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  count,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-ink bg-canvas">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
        <span className="flex-1 text-xs font-mono font-bold uppercase tracking-wider">
          {title}
        </span>
        {count > 0 && (
          <span className="text-[10px] font-mono text-ink-soft bg-canvas-alt border border-ink/30 px-1.5">
            {count}
          </span>
        )}
      </button>
      {expanded && (
        <div className="border-t-2 border-ink p-3">{children}</div>
      )}
    </div>
  );
}

function CollapsibleEntry({
  label,
  expanded,
  onToggle,
  onDelete,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-ink/50 bg-canvas-alt">
      <div className="flex items-center gap-1 px-2 py-1">
        <button onClick={onToggle} className="p-0.5 text-ink-soft hover:text-ink">
          {expanded ? (
            <ChevronDown size={12} />
          ) : (
            <ChevronRight size={12} />
          )}
        </button>
        <button
          onClick={onToggle}
          className="flex-1 text-left text-[11px] font-mono truncate text-ink"
        >
          {label}
        </button>
        <button
          onClick={onDelete}
          className="p-0.5 text-ink-soft hover:text-[#dc2626]"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-ink/50 p-2">{children}</div>
      )}
    </div>
  );
}

function BulletsEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  return (
    <div className="space-y-0.5">
      {bullets.map((bullet, bi) => (
        <div key={bi} className="flex gap-1">
          <input
            value={bullet}
            onChange={(e) => {
              const newBullets = [...bullets];
              newBullets[bi] = e.target.value;
              onChange(newBullets);
            }}
            className="flex-1 bg-canvas border-2 border-ink px-2 py-0.5 text-ink outline-none font-mono text-[11px]"
            placeholder="Bullet point"
          />
          <button
            onClick={() => onChange(bullets.filter((_, i) => i !== bi))}
            className="p-0.5 text-ink-soft hover:text-[#dc2626]"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...bullets, ""])}
        className="flex items-center gap-1 text-[10px] font-mono text-ink-soft hover:text-ink"
      >
        <Plus size={10} /> Add bullet
      </button>
    </div>
  );
}
