"use client";

import { ResumeData } from "./resume-types";

export default function Minimal({ data }: { data: ResumeData }) {
  const { personalInfo, education, experience, skills, projects, customSections } = data;

  const sectionStyle = { marginBottom: "24px" };
  const headingStyle = {
    fontSize: "11px",
    fontWeight: 500 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    color: "#999",
    marginBottom: "10px",
    borderBottom: "1px solid #e5e5e5",
    paddingBottom: "6px",
  };

  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "10.5px",
        lineHeight: 1.6,
        color: "#333",
        padding: "48px 56px",
        width: "100%",
        minHeight: "1122px",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 300, margin: 0, letterSpacing: "-0.5px" }}>
          {personalInfo.name}
        </h1>
        <div style={{ marginTop: "8px", fontSize: "10px", color: "#888" }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join("  ·  ")}
        </div>
        {personalInfo.links && personalInfo.links.length > 0 && (
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#888" }}>
            {personalInfo.links.map((link, i) => (
              <span key={i}>
                {i > 0 && "  ·  "}
                <a href={link.url} style={{ color: "#555", textDecoration: "none" }}>
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>

      {education.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 500 }}>{edu.institution}</span>
                <span style={{ fontSize: "10px", color: "#999" }}>
                  {edu.startDate && `${edu.startDate} — ${edu.endDate || "Present"}`}
                </span>
              </div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                {edu.degree && <span>{edu.degree}</span>}
                {edu.field && <span> · {edu.field}</span>}
                {edu.gpa && <span> · GPA: {edu.gpa}</span>}
              </div>
              {edu.bullets && edu.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "#555" }}>
                  {edu.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Skills</h2>
          {skills.map((cat, i) => (
            <div key={i} style={{ marginBottom: "2px" }}>
              <span style={{ color: "#999" }}>{cat.category}:</span>{" "}
              {cat.items.join(", ")}
            </div>
          ))}
        </div>
      )}

      {experience.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  <span style={{ fontWeight: 500 }}>{exp.title}</span>
                  <span style={{ color: "#999" }}> · {exp.company}</span>
                </span>
                <span style={{ fontSize: "10px", color: "#999" }}>
                  {exp.startDate && `${exp.startDate} — ${exp.endDate || "Present"}`}
                </span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "#555" }}>
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
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <span style={{ fontWeight: 500 }}>{proj.name}</span>
              {proj.urls && proj.urls.length > 0 && (
                <span style={{ marginLeft: "8px", fontSize: "10px" }}>
                  {proj.urls.map((u, j) => (
                    <span key={j}>
                      {j > 0 && " · "}
                      <a href={u.url} style={{ color: "#555", textDecoration: "none" }}>
                        {u.label}
                      </a>
                    </span>
                  ))}
                </span>
              )}
              {proj.bullets && proj.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "#555" }}>
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
          <h2 style={headingStyle}>{sec.name}</h2>
          {sec.bullets && sec.bullets.length > 0 && (
            <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "#555" }}>
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
