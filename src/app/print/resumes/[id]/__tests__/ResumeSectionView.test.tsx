import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ResumeSectionView } from "../page";
import type { ResumeSection } from "../page";

afterEach(cleanup);

function makeSection(overrides: Partial<ResumeSection>): ResumeSection {
  return {
    id: "test-1",
    type: "summary",
    order: 0,
    visible: true,
    name: "",
    experienceEntries: [],
    educationEntries: [],
    projectEntries: [],
    customEntries: [],
    ...overrides,
  };
}

describe("ResumeSectionView — personal_info", () => {
  it("renders nothing when section is not visible", () => {
    const { container } = render(
      <ResumeSectionView
        section={makeSection({ visible: false, type: "personal_info" })}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when personal_info has no entries", () => {
    const { container } = render(
      <ResumeSectionView
        section={makeSection({ type: "personal_info", customEntries: [] })}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders name from personal_info JSON content", () => {
    render(
      <ResumeSectionView
        section={makeSection({
          type: "personal_info",
          customEntries: [
            {
              id: "pi-1",
              content: JSON.stringify({ name: "Alice Smith" }),
              bullets: [],
              order: 0,
            },
          ],
        })}
      />
    );
    expect(screen.getByText("Alice Smith")).toBeTruthy();
  });

  it("renders contact parts joined by bullet", () => {
    render(
      <ResumeSectionView
        section={makeSection({
          type: "personal_info",
          customEntries: [
            {
              id: "pi-1",
              content: JSON.stringify({
                name: "Bob",
                email: "bob@test.com",
                phone: "555-0100",
              }),
              bullets: [],
              order: 0,
            },
          ],
        })}
      />
    );
    expect(screen.getByText("bob@test.com • 555-0100")).toBeTruthy();
  });

  it("shows fallback when personal_info content is empty JSON", () => {
    render(
      <ResumeSectionView
        section={makeSection({
          type: "personal_info",
          customEntries: [
            {
              id: "pi-1",
              content: "{}",
              bullets: [],
              order: 0,
            },
          ],
        })}
      />
    );
    expect(screen.getByText("Your Name")).toBeTruthy();
  });
});

describe("ResumeSectionView — summary", () => {
  it("renders section name and content", () => {
    render(
      <ResumeSectionView
        section={makeSection({
          type: "summary",
          name: "Professional Summary",
          customEntries: [
            {
              id: "sum-1",
              content: "Experienced developer with 5 years...",
              bullets: [],
              order: 0,
            },
          ],
        })}
      />
    );
    expect(screen.getByText("Professional Summary")).toBeTruthy();
    expect(screen.getByText("Experienced developer with 5 years...")).toBeTruthy();
  });

  it("renders nothing when summary has no entries", () => {
    const { container } = render(
      <ResumeSectionView
        section={makeSection({
          type: "summary",
          customEntries: [],
        })}
      />
    );
    expect(container.innerHTML).toBe("");
  });
});

describe("ResumeSectionView — experience", () => {
  it("renders experience entries with title and company", () => {
    const { container } = render(
      <ResumeSectionView
        section={makeSection({
          type: "experience",
          experienceEntries: [
            {
              id: "exp-1",
              title: "Engineer",
              company: "Acme",
              location: null,
              startDate: null,
              endDate: null,
              current: false,
              bullets: [],
              order: 0,
            },
          ],
        })}
      />
    );
    expect(screen.getByText("Engineer")).toBeTruthy();
    expect(container.textContent).toContain("Acme");
  });
});

describe("ResumeSectionView — education", () => {
  it("renders education entries", () => {
    const { container } = render(
      <ResumeSectionView
        section={makeSection({
          type: "education",
          educationEntries: [
            {
              id: "edu-1",
              institution: "MIT",
              degree: "BS",
              field: "CS",
              startDate: null,
              endDate: null,
              gpa: null,
              bullets: [],
              order: 0,
            },
          ],
        })}
      />
    );
    expect(screen.getByText("MIT")).toBeTruthy();
    expect(container.textContent).toContain("BS");
  });
});
