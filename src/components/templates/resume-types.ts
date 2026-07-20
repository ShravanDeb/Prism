export interface ResumeData {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: { label: string; url: string }[];
  };
  education: {
    institution: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    bullets?: string[];
  }[];
  experience: {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    urls?: { label: string; url: string }[];
    bullets?: string[];
  }[];
  customSections: {
    name: string;
    bullets?: string[];
  }[];
}
