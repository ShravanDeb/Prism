"use client";

interface TemplatePreviewProps {
  templateId: string;
}

function Line({ w = "100%", h = 6, color = "currentColor", opacity = 0.15, mb = 4 }: { w?: string; h?: number; color?: string; opacity?: number; mb?: number }) {
  return <div style={{ width: w, height: h, backgroundColor: color, opacity, marginBottom: mb, borderRadius: 1 }} />;
}

function Block({ w = "100%", h = 40, color = "currentColor", opacity = 0.06, mb = 6, children }: { w?: string; h?: number; color?: string; opacity?: number; mb?: number; children?: React.ReactNode }) {
  return <div style={{ width: w, height: h, backgroundColor: color, opacity, marginBottom: mb, borderRadius: 2, padding: 4, display: "flex", flexDirection: "column", justifyContent: "center" }}>{children}</div>;
}

function Dots({ count = 3, color = "currentColor" }: { count?: number; color?: string }) {
  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, opacity: 0.2 }} />
      ))}
    </div>
  );
}

function SectionLabel({ children, color = "#1a1a1a" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 5, fontWeight: 700, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, color, opacity: 0.6 }}>
      {children}
    </div>
  );
}

export default function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const wrap: React.CSSProperties = {
    width: "100%",
    aspectRatio: "3/4",
    backgroundColor: "#fff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 2,
    padding: "8px 6px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  if (templateId === "classic") {
    return (
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{ width: "60%", height: 7, backgroundColor: "#1a1a1a", opacity: 0.7, margin: "0 auto 3px", borderRadius: 1 }} />
          <Line w="40%" h={3} mb={2} opacity={0.1} />
        </div>
        <SectionLabel>Education</SectionLabel>
        <Line w="80%" h={3} mb={2} opacity={0.12} />
        <Line w="50%" h={3} mb={4} opacity={0.08} />
        <SectionLabel>Skills</SectionLabel>
        <Line w="90%" h={3} mb={2} opacity={0.12} />
        <Line w="70%" h={3} mb={4} opacity={0.08} />
        <SectionLabel>Experience</SectionLabel>
        <Line w="85%" h={3} mb={2} opacity={0.12} />
        <div style={{ paddingLeft: 4 }}>
          <Line w="95%" h={2} mb={2} opacity={0.07} />
          <Line w="90%" h={2} mb={2} opacity={0.07} />
          <Line w="80%" h={2} mb={4} opacity={0.07} />
        </div>
        <SectionLabel>Projects</SectionLabel>
        <Line w="75%" h={3} mb={3} opacity={0.1} />
        <Line w="85%" h={3} mb={2} opacity={0.1} />
      </div>
    );
  }

  if (templateId === "modern") {
    return (
      <div style={{ ...wrap, flexDirection: "row", padding: 0 }}>
        <div style={{ width: "35%", backgroundColor: "#1a1a1a", opacity: 0.85, padding: "8px 5px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff", opacity: 0.9, marginBottom: 2 }} />
          <div style={{ width: "80%", height: 3, backgroundColor: "#fff", opacity: 0.4, marginBottom: 1 }} />
          <div style={{ width: "60%", height: 3, backgroundColor: "#fff", opacity: 0.3, marginBottom: 6 }} />
          <div style={{ fontSize: 4, color: "#fff", opacity: 0.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Skills</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: "90%", height: 2, backgroundColor: "#fff", opacity: 0.25 }} />)}
          </div>
        </div>
        <div style={{ flex: 1, padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
          <SectionLabel>Education</SectionLabel>
          <Line w="80%" h={3} mb={2} opacity={0.12} />
          <Line w="50%" h={3} mb={4} opacity={0.08} />
          <SectionLabel>Experience</SectionLabel>
          <Line w="90%" h={3} mb={2} opacity={0.12} />
          <div style={{ paddingLeft: 3 }}>
            <Line w="95%" h={2} mb={2} opacity={0.07} />
            <Line w="85%" h={2} mb={4} opacity={0.07} />
          </div>
          <SectionLabel>Projects</SectionLabel>
          <Line w="70%" h={3} mb={3} opacity={0.1} />
        </div>
      </div>
    );
  }

  if (templateId === "minimal") {
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ width: "40%", height: 6, backgroundColor: "#1a1a1a", opacity: 0.6, marginBottom: 3 }} />
          <Line w="30%" h={2} mb={2} opacity={0.08} />
        </div>
        <SectionLabel>Education</SectionLabel>
        <Line w="70%" h={3} mb={4} opacity={0.1} />
        <SectionLabel>Skills</SectionLabel>
        <Line w="85%" h={3} mb={4} opacity={0.1} />
        <SectionLabel>Experience</SectionLabel>
        <Line w="90%" h={3} mb={2} opacity={0.1} />
        <div style={{ paddingLeft: 3 }}>
          <Line w="95%" h={2} mb={2} opacity={0.06} />
          <Line w="88%" h={2} mb={2} opacity={0.06} />
          <Line w="80%" h={2} mb={4} opacity={0.06} />
        </div>
        <SectionLabel>Projects</SectionLabel>
        <Line w="75%" h={3} mb={3} opacity={0.1} />
      </div>
    );
  }

  if (templateId === "executive") {
    return (
      <div style={wrap}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{ width: "50%", height: 7, backgroundColor: "#1a1a1a", opacity: 0.7, margin: "0 auto 3px" }} />
          <div style={{ width: "30%", height: 1, backgroundColor: "#1a1a1a", opacity: 0.3, margin: "0 auto 3px" }} />
          <Line w="35%" h={2} mb={2} opacity={0.08} />
        </div>
        <SectionLabel color="#2d2d2d">Education</SectionLabel>
        <div style={{ width: "100%", height: 1, backgroundColor: "#1a1a1a", opacity: 0.1, marginBottom: 3 }} />
        <Line w="75%" h={3} mb={4} opacity={0.1} />
        <SectionLabel color="#2d2d2d">Skills</SectionLabel>
        <div style={{ width: "100%", height: 1, backgroundColor: "#1a1a1a", opacity: 0.1, marginBottom: 3 }} />
        <Line w="85%" h={3} mb={4} opacity={0.1} />
        <SectionLabel color="#2d2d2d">Experience</SectionLabel>
        <div style={{ width: "100%", height: 1, backgroundColor: "#1a1a1a", opacity: 0.1, marginBottom: 3 }} />
        <Line w="90%" h={3} mb={2} opacity={0.1} />
        <div style={{ paddingLeft: 3 }}>
          <Line w="95%" h={2} mb={2} opacity={0.06} />
          <Line w="88%" h={2} mb={4} opacity={0.06} />
        </div>
        <SectionLabel color="#2d2d2d">Projects</SectionLabel>
        <div style={{ width: "100%", height: 1, backgroundColor: "#1a1a1a", opacity: 0.1, marginBottom: 3 }} />
        <Line w="70%" h={3} mb={2} opacity={0.1} />
      </div>
    );
  }

  if (templateId === "creative") {
    return (
      <div style={wrap}>
        <div style={{ backgroundColor: "#7c3aed", opacity: 0.9, borderRadius: 2, padding: "6px 5px", marginBottom: 6 }}>
          <div style={{ width: "45%", height: 6, backgroundColor: "#fff", opacity: 0.9, marginBottom: 3 }} />
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: 12, height: 3, backgroundColor: "#fff", opacity: 0.3, borderRadius: 1 }} />)}
          </div>
        </div>
        <SectionLabel color="#7c3aed">Education</SectionLabel>
        <Line w="75%" h={3} mb={4} opacity={0.1} />
        <SectionLabel color="#7c3aed">Skills</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 5 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ width: 16 + Math.random() * 10, height: 5, backgroundColor: "#7c3aed", opacity: 0.12, borderRadius: 3 }} />
          ))}
        </div>
        <SectionLabel color="#7c3aed">Experience</SectionLabel>
        <Line w="85%" h={3} mb={2} opacity={0.12} />
        <div style={{ paddingLeft: 3 }}>
          <Line w="95%" h={2} mb={2} opacity={0.06} />
          <Line w="80%" h={2} mb={4} opacity={0.06} />
        </div>
        <SectionLabel color="#7c3aed">Projects</SectionLabel>
        <Line w="70%" h={3} mb={2} opacity={0.1} />
      </div>
    );
  }

  if (templateId === "technical") {
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 5 }}>
          <div style={{ width: "40%", height: 6, backgroundColor: "#1a1a1a", opacity: 0.7, marginBottom: 3 }} />
          <Line w="30%" h={2} mb={4} opacity={0.08} />
        </div>
        <SectionLabel color="#2563eb">Skills</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 5 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ backgroundColor: "#2563eb", opacity: 0.06, borderRadius: 2, padding: 3 }}>
              <div style={{ width: "60%", height: 2, backgroundColor: "#2563eb", opacity: 0.3, marginBottom: 2 }} />
              <div style={{ width: "90%", height: 2, backgroundColor: "#1a1a1a", opacity: 0.08 }} />
            </div>
          ))}
        </div>
        <SectionLabel>Experience</SectionLabel>
        <Line w="85%" h={3} mb={2} opacity={0.12} />
        <div style={{ paddingLeft: 3 }}>
          <Line w="95%" h={2} mb={2} opacity={0.06} />
          <Line w="88%" h={2} mb={4} opacity={0.06} />
        </div>
        <SectionLabel>Projects</SectionLabel>
        <Line w="75%" h={3} mb={2} opacity={0.1} />
      </div>
    );
  }

  return <div style={wrap} />;
}
