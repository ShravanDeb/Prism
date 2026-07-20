"use client";

import { ResumeData } from "./resume-types";

export default function Executive({ data }: { data: ResumeData }) {
  const { personalInfo, education, experience, skills, projects, customSections } = data;

  const sectionStyle = { marginBottom: "22px" };
  const headingStyle = {
    fontSize: "13px",
    fontWeight: 400 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "3px",
    color: "#1a1a1a",
    marginBottom: "10px",
    borderBottom: "2px solid #1a1a1a",
    paddingBottom: "6px",
  };

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "11px",
        lineHeight: 1.55,
        color: "#222",
        padding: "44px 48px",
        width: "100%",
        minHeight: "1122px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 400,
            margin: 0,
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          {personalInfo.name}
        </h1>
        <div
          style={{
            width: "120px",
            height: "1px",
            backgroundColor: "#1a1a1a",
            margin: "10px auto",
          }}
        />
        <div style={{ fontSize: "10px", color: "#666", letterSpacing: "1px" }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join("   ·   ")}
        </div>
        {personalInfo.links && personalInfo.links.length > 0 && (
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#666", letterSpacing: "1px" }}>
            {personalInfo.links.map((link, i) => (
              <span key={i}>
                {i > 0 && "   ·   "}
                <a href={link.url} style={{ color: "#444", textDecoration: "none" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontStyle: "italic" }}>{edu.institution}</span>
                <span style={{ fontSize: "10px", color: "#888" }}>
                  {edu.startDate && `${edu.startDate} — ${edu.endDate || "Present"}`}
                </span>
              </div>
              <div style={{ fontStyle: "italic", color: "#555" }}>
                {edu.degree && <span>{edu.degree}</span>}
                {edu.field && <span>, {edu.field}</span>}
                {edu.gpa && <span> — GPA: {edu.gpa}</span>}
              </div>
              {edu.bullets && edu.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
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
          <div>
            {skills.map((cat, i) => (
              <div key={i} style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: 700, fontStyle: "italic" }}>{cat.category}:</span>{" "}
                {cat.items.join(", ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Professional Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <span style={{ fontWeight: 700, fontStyle: "italic" }}>{exp.title}</span>
                  <span style={{ color: "#666" }}> — {exp.company}</span>
                </span>
                <span style={{ fontSize: "10px", color: "#888" }}>
                  {exp.startDate && `${exp.startDate} — ${exp.endDate || "Present"}`}
                </span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
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
              <span style={{ fontWeight: 700, fontStyle: "italic" }}>{proj.name}</span>
              {proj.urls && proj.urls.length > 0 && (
                <span style={{ marginLeft: "8px", fontSize: "10px", color: "#888" }}>
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
                <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
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
            <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
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
