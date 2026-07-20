"use client";

import { ResumeData } from "./resume-types";

export default function Technical({ data }: { data: ResumeData }) {
  const { personalInfo, education, experience, skills, projects, customSections } = data;

  const sectionStyle = { marginBottom: "20px" };
  const headingStyle = {
    fontSize: "12px",
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    color: "#111",
    marginBottom: "10px",
    paddingBottom: "4px",
    borderBottom: "2px solid #e5e7eb",
  };

  return (
    <div
      style={{
        fontFamily: "'Consolas', 'Courier New', monospace",
        fontSize: "10px",
        lineHeight: 1.55,
        color: "#333",
        padding: "36px 40px",
        width: "100%",
        minHeight: "1122px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
          {personalInfo.name}
        </h1>
        <div style={{ marginTop: "6px", fontSize: "9.5px", color: "#666" }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join(" | ")}
        </div>
        {personalInfo.links && personalInfo.links.length > 0 && (
          <div style={{ marginTop: "4px", fontSize: "9.5px", color: "#666" }}>
            {personalInfo.links.map((link, i) => (
              <span key={i}>
                {i > 0 && " | "}
                <a href={link.url} style={{ color: "#1a56db", textDecoration: "none" }}>
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Skills Grid - Prominent */}
      {skills.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Technical Skills</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              padding: "10px",
            }}
          >
            {skills.map((cat, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: "9.5px", color: "#1a56db", marginBottom: "3px" }}>
                  {cat.category}
                </div>
                <div style={{ fontSize: "9.5px", color: "#555" }}>
                  {cat.items.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience - Compact */}
      {experience.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{exp.title}</span>
                <span style={{ fontSize: "9.5px", color: "#999" }}>
                  {exp.startDate && `${exp.startDate} — ${exp.endDate || "Present"}`}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", color: "#1a56db", marginBottom: "3px" }}>
                {exp.company}
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects - Compact */}
      {projects.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div>
                <span style={{ fontWeight: 700 }}>{proj.name}</span>
                {proj.urls && proj.urls.length > 0 && (
                  <span style={{ marginLeft: "8px", fontSize: "9px" }}>
                    {proj.urls.map((u, j) => (
                      <span key={j}>
                        {j > 0 && " | "}
                        <a href={u.url} style={{ color: "#1a56db", textDecoration: "none" }}>
                          {u.label}
                        </a>
                      </span>
                    ))}
                  </span>
                )}
              </div>
              {proj.bullets && proj.bullets.length > 0 && (
                <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
                  {proj.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education - Compact */}
      {education.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{edu.institution}</span>
                <span style={{ fontSize: "9.5px", color: "#999" }}>
                  {edu.startDate && `${edu.startDate} — ${edu.endDate || "Present"}`}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", color: "#555" }}>
                {edu.degree && <span>{edu.degree}</span>}
                {edu.field && <span> · {edu.field}</span>}
                {edu.gpa && <span> · GPA: {edu.gpa}</span>}
              </div>
              {edu.bullets && edu.bullets.length > 0 && (
                <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
                  {edu.bullets.map((b, j) => (
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
          <h2 style={headingStyle}>{sec.name}</h2>
          {sec.bullets && sec.bullets.length > 0 && (
            <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
              {sec.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
