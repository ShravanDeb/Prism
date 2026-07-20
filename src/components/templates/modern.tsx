"use client";

import { ResumeData } from "./resume-types";

export default function Modern({ data }: { data: ResumeData }) {
  const { personalInfo, education, experience, skills, projects, customSections } = data;

  const sectionHeading = {
    fontSize: "12px",
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "10px",
    color: "#1a1a1a",
  };

  const sidebarSection = {
    marginBottom: "20px",
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        fontSize: "10.5px",
        lineHeight: 1.5,
        color: "#333",
        display: "flex",
        width: "100%",
        minHeight: "1122px",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: "30%",
          backgroundColor: "#1e293b",
          color: "#f1f5f9",
          padding: "32px 20px",
          boxSizing: "border-box" as const,
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#fff" }}>
          {personalInfo.name}
        </h1>

        <div style={{ marginTop: "20px", ...sidebarSection }}>
          <h3 style={{ ...sectionHeading, fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
            Contact
          </h3>
          <div style={{ fontSize: "10px", lineHeight: 1.8 }}>
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
            {personalInfo.links && personalInfo.links.map((link, i) => (
              <div key={i}>
                <a href={link.url} style={{ color: "#e2e8f0", textDecoration: "underline" }}>
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        </div>

        {skills.length > 0 && (
          <div style={sidebarSection}>
            <h3 style={{ ...sectionHeading, fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
              Skills
            </h3>
            {skills.map((cat, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: 700, fontSize: "10px", marginBottom: "2px" }}>
                  {cat.category}
                </div>
                <div style={{ fontSize: "10px", lineHeight: 1.6 }}>
                  {cat.items.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Main Area */}
      <div
        style={{
          width: "70%",
          padding: "32px 28px",
          boxSizing: "border-box" as const,
        }}
      >
        {education.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Education</h2>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>{edu.institution}</span>
                  <span style={{ color: "#666" }}>
                    {edu.startDate && `${edu.startDate} — ${edu.endDate || "Present"}`}
                  </span>
                </div>
                <div>
                  {edu.degree && <span>{edu.degree}</span>}
                  {edu.field && <span> in {edu.field}</span>}
                </div>
                {edu.gpa && <div style={{ fontSize: "10px", color: "#666" }}>GPA: {edu.gpa}</div>}
                {edu.bullets && edu.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {edu.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>
                    {exp.title}
                    <span style={{ fontWeight: 400 }}> — {exp.company}</span>
                  </span>
                  <span style={{ color: "#666" }}>
                    {exp.startDate && `${exp.startDate} — ${exp.endDate || "Present"}`}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Projects</h2>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <span style={{ fontWeight: 700 }}>{proj.name}</span>
                {proj.urls && proj.urls.length > 0 && (
                  <span style={{ marginLeft: "8px" }}>
                    {proj.urls.map((u, j) => (
                      <span key={j}>
                        {j > 0 && " | "}
                        <a href={u.url} style={{ color: "#1e293b", textDecoration: "underline" }}>
                          {u.label}
                        </a>
                      </span>
                    ))}
                  </span>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {proj.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {customSections.map((sec, i) => (
          <div key={i} style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>{sec.name}</h2>
            {sec.bullets && sec.bullets.length > 0 && (
              <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                {sec.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
