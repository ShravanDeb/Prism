"use client";
import type { ResumeData } from "../types";
import { SectionHeader, SectionEntries } from "./SectionContent";

export default function Standard2Col({
  resume,
  displayName,
  contactLine,
  template,
}: {
  resume: ResumeData;
  displayName: string;
  contactLine: string;
  template: { id: string; label: string };
}) {
  const accent = resume.accentColor;
  const visibleSections = resume.sections.filter((s) => s.visible && s.type !== "personal_info");
  return (
    <div className="max-w-3xl mx-auto bg-canvas-alt border-2 border-ink shadow-[6px_6px_0_rgba(0,0,0,0.25)]">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-display mb-0.5" style={{ color: accent }}>
            {displayName}
          </h2>
          <p className="text-xs font-mono text-ink-soft">{contactLine}</p>
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-6">
          {visibleSections.map((section, si) => (
            <div key={section.id} className={si % 2 === 0 ? "col-start-1" : "col-start-2"}>
              <SectionHeader section={section} accent={accent} templateId={resume.templateId} />
              <SectionEntries section={section} />
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t-2 border-ink flex items-center justify-between text-[10px] font-mono text-ink-soft">
          <span>PRISM — {template.label}</span>
          <span>{resume.pageSize}</span>
        </div>
      </div>
    </div>
  );
}
