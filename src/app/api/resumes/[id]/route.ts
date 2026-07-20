import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

const INCLUDE = {
  sections: {
    include: {
      experienceEntries: true,
      educationEntries: true,
      projectEntries: true,
      skillCategories: true,
      customSections: true,
    },
    orderBy: { order: "asc" as const },
  },
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await syncUser(user);

    const resume = await prisma.masterResume.findFirst({
      where: { id, userId: user.id },
      include: INCLUDE,
    });

    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ resume });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await syncUser(user);

    const masterResume = await prisma.masterResume.findFirst({ where: { id, userId: user.id } });
    if (!masterResume) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.$transaction(async (tx) => {
      const metadata: Record<string, any> = {};
      if (body.title !== undefined) metadata.title = body.title;
      if (body.templateId !== undefined) metadata.templateId = body.templateId;
      if (body.pageSize !== undefined) metadata.pageSize = body.pageSize;
      if (body.accentColor !== undefined) metadata.accentColor = body.accentColor;
      if (body.personalInfo !== undefined) metadata.personalInfo = body.personalInfo;
      if (body.status !== undefined) metadata.status = body.status;

      if (Object.keys(metadata).length > 0) {
        await tx.masterResume.update({ where: { id }, data: metadata });
      }

      if (body.sections && Array.isArray(body.sections)) {
        await tx.resumeSection.deleteMany({ where: { masterResumeId: id } });

        for (const section of body.sections) {
          if (!section.type) continue;

          const newSection = await tx.resumeSection.create({
            data: {
              masterResumeId: id,
              type: section.type,
              order: typeof section.order === "number" ? section.order : 0,
              visible: section.visible !== false,
              name: section.name || "",
            },
          });

          if (section.type === "experience" && Array.isArray(section.entries)) {
            for (let i = 0; i < section.entries.length; i++) {
              const e = section.entries[i];
              await tx.experienceEntry.create({
                data: {
                  sectionId: newSection.id,
                  title: e.title || "",
                  company: e.company || "",
                  location: e.location || null,
                  startDate: e.startDate || null,
                  endDate: e.endDate || null,
                  current: e.current || false,
                  bullets: Array.isArray(e.bullets) ? e.bullets : [],
                  order: i,
                },
              });
            }
          } else if (section.type === "education" && Array.isArray(section.entries)) {
            for (let i = 0; i < section.entries.length; i++) {
              const e = section.entries[i];
              await tx.educationEntry.create({
                data: {
                  sectionId: newSection.id,
                  institution: e.institution || "",
                  degree: e.degree || "",
                  field: e.field || null,
                  startDate: e.startDate || null,
                  endDate: e.endDate || null,
                  gpa: e.gpa || null,
                  bullets: Array.isArray(e.bullets) ? e.bullets : [],
                  order: i,
                },
              });
            }
          } else if (section.type === "projects" && Array.isArray(section.entries)) {
            for (let i = 0; i < section.entries.length; i++) {
              const e = section.entries[i];
              await tx.projectEntry.create({
                data: {
                  sectionId: newSection.id,
                  name: e.name || "",
                  description: e.description || null,
                  urls: Array.isArray(e.urls) ? e.urls : (e.url ? [e.url] : []),
                  startDate: e.startDate || null,
                  endDate: e.endDate || null,
                  bullets: Array.isArray(e.bullets) ? e.bullets : [],
                  order: i,
                },
              });
            }
          } else if (section.type === "skills" && Array.isArray(section.entries)) {
            for (let i = 0; i < section.entries.length; i++) {
              const e = section.entries[i];
              await tx.skillCategory.create({
                data: {
                  sectionId: newSection.id,
                  category: e.category || "",
                  items: Array.isArray(e.items) ? e.items : (typeof e.items === "string" ? e.items.split(",").map((s: string) => s.trim()).filter(Boolean) : []),
                  order: i,
                },
              });
            }
          } else if (section.type === "custom" && Array.isArray(section.entries)) {
            for (let i = 0; i < section.entries.length; i++) {
              const e = section.entries[i];
              await tx.customSection.create({
                data: {
                  sectionId: newSection.id,
                  name: e.name || "",
                  bullets: Array.isArray(e.bullets) ? e.bullets : [],
                  order: i,
                },
              });
            }
          }
        }
      }

      return tx.masterResume.findUnique({ where: { id }, include: INCLUDE });
    });

    return NextResponse.json({ resume: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return PUT(request, { params });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await syncUser(user);

    await prisma.masterResume.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
