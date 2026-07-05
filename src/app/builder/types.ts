export type Entry = {
  id: string;
  order: number;
  type: string;
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  institution?: string;
  degree?: string;
  field?: string;
  gpa?: string;
  name?: string;
  description?: string;
  url?: string;
  content?: string;
  bullets: string[];
};

export type ResumeSection = {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  name: string;
  entries: Entry[];
};

export type ResumeData = {
  id: string;
  title: string;
  templateId: string;
  pageSize: string;
  accentColor: string;
  status: string;
  sections: ResumeSection[];
};
