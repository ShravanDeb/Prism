"use client";
import type { ResumeData } from "../types";
import { SectionHeader, SectionEntries } from "./SectionContent";

export default function Standard1Col({
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
  return (
    <div className="max-w-3xl mx-auto bg-canvas-alt border-2 border-ink shadow-[6px_6px_0_rgba(0,0,0,0.25)]">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-display mb-0.5" style={{ color: accent }}>
            {displayName}
          </h2>
          <p className="text-xs font-mono text-ink-soft">{contactLine}</p>
        </div>
        <div className="space-y-5">
          {resume.sections.filter((s) => s.visible).map((section) => (
            <div key={section.id}>
              {section.type !== "personal_info" && (
                <SectionHeader section={section} accent={accent} templateId={resume.templateId} />
              )}
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
