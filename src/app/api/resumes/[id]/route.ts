import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

const ALLOWED_METADATA = ["templateId", "pageSize", "accentColor", "title"];

const SECTION_ENTRY_TYPES = new Set(["experience", "education", "projects", "additional", "summary", "personal_info"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  let resume = await prisma.masterResume.findFirst({
    where: { id, userId: user.id },
    include: {
      sections: {
        include: { experienceEntries: true, educationEntries: true, projectEntries: true, customEntries: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!resume) {
    resume = await prisma.tailoredResume.findFirst({
      where: { id, userId: user.id },
      include: {
        sections: {
          include: { experienceEntries: true, educationEntries: true, projectEntries: true, customEntries: true },
          orderBy: { order: "asc" },
        },
      },
    }) as any;
  }

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ resume });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const body = await request.json();

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const masterResume = await prisma.masterResume.findFirst({ where: { id, userId: user.id } });
  const isTailored = !masterResume;
  const resumeModel = isTailored
    ? await prisma.tailoredResume.findFirst({ where: { id, userId: user.id } })
    : masterResume;

  if (!resumeModel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowedMetadata: Record<string, any> = {};
  for (const field of ALLOWED_METADATA) {
    if (body[field] !== undefined) allowedMetadata[field] = body[field];
  }

  if (body.sections !== undefined && !Array.isArray(body.sections)) {
    return NextResponse.json({ error: "sections must be an array" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const model = isTailored ? tx.tailoredResume : tx.masterResume;
    const resume = model as any;

    if (Object.keys(allowedMetadata).length > 0) {
      await resume.update({ where: { id }, data: allowedMetadata });
    }

    if (body.sections) {
      const sectionModel = tx.resumeSection;
      await sectionModel.deleteMany({ where: { [isTailored ? "tailoredResumeId" : "masterResumeId"]: id } });

      for (const section of body.sections) {
        if (!section.type || !SECTION_ENTRY_TYPES.has(section.type)) continue;

        const newSection = await sectionModel.create({
          data: {
            [isTailored ? "tailoredResumeId" : "masterResumeId"]: id,
            type: section.type,
            order: typeof section.order === "number" ? section.order : 0,
            visible: section.visible !== false,
            name: section.name || "",
          },
        });

        const entries = Array.isArray(section.entries) ? section.entries : [];

        for (const entry of entries) {
          if (section.type === "experience") {
            await tx.experienceEntry.create({
              data: {
                sectionId: newSection.id,
                title: entry.title || "",
                company: entry.company || "",
                location: entry.location || null,
                startDate: entry.startDate || null,
                endDate: entry.endDate || null,
                current: entry.current || false,
                bullets: Array.isArray(entry.bullets) ? entry.bullets : [],
                order: typeof entry.order === "number" ? entry.order : 0,
              },
            });
          } else if (section.type === "education") {
            await tx.educationEntry.create({
              data: {
                sectionId: newSection.id,
                institution: entry.institution || "",
                degree: entry.degree || "",
                field: entry.field || null,
                startDate: entry.startDate || null,
                endDate: entry.endDate || null,
                gpa: entry.gpa || null,
                bullets: Array.isArray(entry.bullets) ? entry.bullets : [],
                order: typeof entry.order === "number" ? entry.order : 0,
              },
            });
          } else if (section.type === "projects") {
            await tx.projectEntry.create({
              data: {
                sectionId: newSection.id,
                name: entry.name || "",
                description: entry.description || null,
                url: entry.url || null,
                startDate: entry.startDate || null,
                endDate: entry.endDate || null,
                bullets: Array.isArray(entry.bullets) ? entry.bullets : [],
                order: typeof entry.order === "number" ? entry.order : 0,
              },
            });
          } else {
            await tx.customEntry.create({
              data: {
                sectionId: newSection.id,
                content: entry.content || "",
                bullets: Array.isArray(entry.bullets) ? entry.bullets : [],
                order: typeof entry.order === "number" ? entry.order : 0,
              },
            });
          }
        }
      }
    }

    const modelName = isTailored ? tx.tailoredResume : tx.masterResume;
    return (modelName as any).findUnique({
      where: { id },
      include: {
        sections: {
          include: { experienceEntries: true, educationEntries: true, projectEntries: true, customEntries: true },
          orderBy: { order: "asc" },
        },
      },
    });
  });

  return NextResponse.json({ resume: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  try {
    await prisma.masterResume.deleteMany({ where: { id, userId: user.id } });
    await prisma.tailoredResume.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
