"use client";
import type { ResumeSection } from "../types";

const SECTION_LABELS: Record<string, string> = {
  personal_info: "Personal Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  additional: "Additional",
};

export function SectionHeader({
  section,
  accent,
  templateId,
}: {
  section: ResumeSection;
  accent: string;
  templateId: string;
}) {
  const label = section.name || SECTION_LABELS[section.type] || section.type;
  return (
    <div className={`flex items-center gap-2 mb-1.5 ${templateId === "latex" ? "border-b border-ink/30 pb-0.5" : ""}`}>
      {templateId !== "vivid" && (
        <div className="w-4 h-0.5" style={{ backgroundColor: accent }} />
      )}
      <h3
        className={`text-xs font-bold uppercase tracking-widest ${
          templateId === "vivid" ? "text-white px-2 py-0.5" : "text-ink"
        }`}
        style={templateId === "vivid" ? { backgroundColor: accent } : {}}
      >
        {label}
      </h3>
    </div>
  );
}

export function SectionEntries({ section }: { section: ResumeSection }) {
  return (
    <div className="space-y-2">
      {section.type === "summary" && section.entries[0]?.content && (
        <p className="text-xs leading-relaxed text-ink">{section.entries[0].content}</p>
      )}
      {section.type === "experience" &&
        section.entries.map((entry) => (
          <div key={entry.id} className="text-xs">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{entry.title}</span>
              <span className="text-ink-soft">
                {entry.startDate} – {entry.current ? "Present" : entry.endDate}
              </span>
            </div>
            {entry.company && (
              <p className="text-ink-soft">
                {entry.company}
                {entry.location ? `, ${entry.location}` : ""}
              </p>
            )}
            {entry.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-0.5 list-disc list-inside space-y-0.5">
                {entry.bullets.filter(Boolean).map((b, bi) => (
                  <li key={bi} className="text-ink-soft">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      {section.type === "education" &&
        section.entries.map((entry) => (
          <div key={entry.id} className="text-xs">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">
                {entry.degree}
                {entry.field ? ` in ${entry.field}` : ""}
              </span>
              <span className="text-ink-soft">
                {entry.startDate} – {entry.endDate}
              </span>
            </div>
            <p className="text-ink-soft">
              {entry.institution}
              {entry.gpa ? ` — GPA: ${entry.gpa}` : ""}
            </p>
          </div>
        ))}
      {section.type === "projects" &&
        section.entries.map((entry) => (
          <div key={entry.id} className="text-xs">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{entry.name}</span>
              {entry.url && <span className="text-ink-soft text-[10px]">{entry.url}</span>}
            </div>
            {entry.description && <p className="text-ink-soft">{entry.description}</p>}
            {entry.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-0.5 list-disc list-inside space-y-0.5">
                {entry.bullets.filter(Boolean).map((b, bi) => (
                  <li key={bi} className="text-ink-soft">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      {section.type === "additional" &&
        section.entries.map((entry) => (
          <div key={entry.id} className="text-xs">
            {entry.content && <p className="text-ink-soft">{entry.content}</p>}
            {entry.bullets.filter(Boolean).length > 0 && (
              <p className="text-ink-soft">{entry.bullets.filter(Boolean).join(" | ")}</p>
            )}
          </div>
        ))}
      {section.type === "personal_info" && (
        <div className="text-xs text-ink-soft">
          {(function () {
            const piEntry = section.entries[0];
            const piData: Record<string, string> = (() => {
              if (!piEntry?.content) return {};
              try {
                return JSON.parse(piEntry.content);
              } catch {
                return {};
              }
            })();
            const parts = [piData.email, piData.phone, piData.location, piData.links].filter(Boolean);
            return parts.length > 0
              ? parts.join(" • ")
              : "Name, contact, and links configured on this resume.";
          })()}
        </div>
      )}
    </div>
  );
}
