"use client";

import { ResumeData } from "./resume-types";

export default function Creative({ data }: { data: ResumeData }) {
  const { personalInfo, education, experience, skills, projects, customSections } = data;

  const accent = "#6366f1";
  const accentLight = "#eef2ff";
  const sectionStyle = { marginBottom: "20px" };
  const headingStyle = {
    fontSize: "13px",
    fontWeight: 700 as const,
    color: accent,
    marginBottom: "10px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        fontSize: "10.5px",
        lineHeight: 1.55,
        color: "#333",
        width: "100%",
        minHeight: "1122px",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: accent,
          color: "#fff",
          padding: "32px 40px",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            margin: 0,
            color: "#fff",
          }}
        >
          {personalInfo.name}
        </h1>
        <div
          style={{
            marginTop: "8px",
            fontSize: "10.5px",
            opacity: 0.9,
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "6px 16px",
          }}
        >
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {personalInfo.links && personalInfo.links.length > 0 && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "10px",
              display: "flex",
              gap: "12px",
            }}
          >
            {personalInfo.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                style={{ color: "#e0e7ff", textDecoration: "underline" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px 40px" }}>
        {skills.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={headingStyle}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: accent,
                }}
              />
              Skills
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "12px 24px" }}>
              {skills.map((cat, i) => (
                <div key={i} style={{ minWidth: "180px" }}>
                  <div style={{ fontWeight: 700, fontSize: "10px", color: accent, marginBottom: "4px" }}>
                    {cat.category}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
                    {cat.items.map((item, j) => (
                      <span
                        key={j}
                        style={{
                          backgroundColor: accentLight,
                          color: "#3730a3",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "9.5px",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {experience.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={headingStyle}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: accent,
                }}
              />
              Experience
            </h2>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    <span style={{ fontWeight: 700 }}>{exp.title}</span>
                    <span style={{ color: "#888" }}> — {exp.company}</span>
                  </span>
                  <span style={{ color: "#999", fontSize: "10px" }}>
                    {exp.startDate && `${exp.startDate} — ${exp.endDate || "Present"}`}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={headingStyle}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: accent,
                }}
              />
              Education
            </h2>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>{edu.institution}</span>
                  <span style={{ color: "#999", fontSize: "10px" }}>
                    {edu.startDate && `${edu.startDate} — ${edu.endDate || "Present"}`}
                  </span>
                </div>
                <div>
                  {edu.degree && <span>{edu.degree}</span>}
                  {edu.field && <span> in {edu.field}</span>}
                  {edu.gpa && <span> · GPA: {edu.gpa}</span>}
                </div>
                {edu.bullets && edu.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {edu.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={headingStyle}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: accent,
                }}
              />
              Projects
            </h2>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: 700 }}>{proj.name}</span>
                {proj.urls && proj.urls.length > 0 && (
                  <span style={{ marginLeft: "8px", fontSize: "10px" }}>
                    {proj.urls.map((u, j) => (
                      <span key={j}>
                        {j > 0 && " | "}
                        <a href={u.url} style={{ color: accent, textDecoration: "underline" }}>
                          {u.label}
                        </a>
                      </span>
                    ))}
                  </span>
                )}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
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
          <div key={i} style={sectionStyle}>
            <h2 style={headingStyle}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: accent,
                }}
              />
              {sec.name}
            </h2>
            {sec.bullets && sec.bullets.length > 0 && (
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
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
