"use client";

import { ResumeData } from "./resume-types";

export default function Classic({ data }: { data: ResumeData }) {
  const { personalInfo, education, experience, skills, projects, customSections } = data;

  const sectionStyle = { marginBottom: "16px" };
  const headingStyle = {
    fontSize: "14px",
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    borderBottom: "1px solid #000",
    paddingBottom: "4px",
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "11px",
        lineHeight: 1.5,
        color: "#000",
        padding: "40px",
        width: "100%",
        minHeight: "1122px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
          {personalInfo.name}
        </h1>
        <div style={{ marginTop: "4px", fontSize: "10px" }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join(" | ")}
        </div>
        {personalInfo.links && personalInfo.links.length > 0 && (
          <div style={{ marginTop: "2px", fontSize: "10px" }}>
            {personalInfo.links.map((link, i) => (
              <span key={i}>
                {i > 0 && " | "}
                <a href={link.url} style={{ color: "#000", textDecoration: "underline" }}>
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
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>
                  {edu.institution}
                  {edu.degree && ` — ${edu.degree}`}
                  {edu.field && ` in ${edu.field}`}
                </span>
                <span>
                  {edu.startDate && `${edu.startDate} — ${edu.endDate || "Present"}`}
                </span>
              </div>
              {edu.gpa && (
                <div style={{ fontSize: "10px" }}>GPA: {edu.gpa}</div>
              )}
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
              <div key={i} style={{ marginBottom: "2px" }}>
                <span style={{ fontWeight: 700 }}>{cat.category}:</span>{" "}
                {cat.items.join(", ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>
                  {exp.title} — {exp.company}
                </span>
                <span>
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
            <div key={i} style={{ marginBottom: "8px" }}>
              <span style={{ fontWeight: 700 }}>{proj.name}</span>
              {proj.urls && proj.urls.length > 0 && (
                <span style={{ fontWeight: 400, marginLeft: "8px" }}>
                  {proj.urls.map((u, j) => (
                    <span key={j}>
                      {j > 0 && " | "}
                      <a href={u.url} style={{ color: "#000", textDecoration: "underline" }}>
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
