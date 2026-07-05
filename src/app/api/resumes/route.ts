import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { ERRORS } from "@/lib/errors";

const WIZARD_STEP_TO_SECTION: Record<string, { type: string; name: string }> = {
  "1": { type: "personal_info", name: "Personal Info" },
  "2": { type: "summary", name: "Summary" },
  "3": { type: "experience", name: "Experience" },
  "4": { type: "education", name: "Education" },
  "5": { type: "additional", name: "Skills" },
  "6": { type: "projects", name: "Projects" },
};

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });
  await syncUser(user);

  const [masterResumes, tailoredResumes] = await Promise.all([
    prisma.masterResume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true, templateId: true },
    }),
    prisma.tailoredResume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true, templateId: true },
    }),
  ]);

  const resumes = [
    ...masterResumes.map((r: any) => ({ ...r, _type: "master" as const })),
    ...tailoredResumes.map((r: any) => ({ ...r, _type: "tailored" as const })),
  ];

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });
    await syncUser(user);

    const body = await request.json();

    if (body.type === "master") {
      const resume = await prisma.$transaction(async (tx) => {
        const r = await tx.masterResume.create({
          data: {
            userId: user.id,
            title: body.title || "Master Resume",
            status: "ready",
          },
        });

        if (body.answers && typeof body.answers === "object") {
          let order = 0;
          for (const [step, answer] of Object.entries(body.answers)) {
            const mapping = WIZARD_STEP_TO_SECTION[step];
            if (!mapping || !answer || !(answer as string).trim()) continue;

            const section = await tx.resumeSection.create({
              data: {
                masterResumeId: r.id,
                type: mapping.type,
                order,
                visible: true,
                name: mapping.name,
              },
            });

            const text = (answer as string).trim();

            if (mapping.type === "personal_info") {
              await tx.customEntry.create({
                data: { sectionId: section.id, content: text, bullets: [], order: 0 },
              });
            } else if (mapping.type === "summary") {
              await tx.customEntry.create({
                data: { sectionId: section.id, content: text, bullets: [], order: 0 },
              });
            } else if (mapping.type === "experience") {
              await tx.customEntry.create({
                data: { sectionId: section.id, content: text, bullets: [], order: 0 },
              });
            } else if (mapping.type === "education") {
              await tx.customEntry.create({
                data: { sectionId: section.id, content: text, bullets: [], order: 0 },
              });
            } else if (mapping.type === "additional") {
              await tx.customEntry.create({
                data: {
                  sectionId: section.id,
                  content: "",
                  bullets: text.split(",").map((s: string) => s.trim()).filter(Boolean),
                  order: 0,
                },
              });
            } else if (mapping.type === "projects") {
              await tx.customEntry.create({
                data: { sectionId: section.id, content: text, bullets: [], order: 0 },
              });
            }

            order++;
          }
        }

        return tx.masterResume.findUnique({
          where: { id: r.id },
          include: {
            sections: {
              include: { experienceEntries: true, educationEntries: true, projectEntries: true, customEntries: true },
              orderBy: { order: "asc" },
            },
          },
        });
      });

      return NextResponse.json(resume);
    }

    if (body.type === "tailored") {
      const resume = await prisma.tailoredResume.create({
        data: {
          userId: user.id,
          masterResumeId: body.masterResumeId,
          title: body.title || "Tailored Resume",
          sourceJobDescriptionId: body.jobDescriptionId || null,
          status: "ready",
        },
      });
      return NextResponse.json(resume);
    }

    return NextResponse.json({ error: ERRORS.invalidType }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
