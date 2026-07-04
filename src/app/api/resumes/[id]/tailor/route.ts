import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const body = await request.json();
  const { jobDescription, style = "full" } = body;

  if (!jobDescription) {
    return NextResponse.json({ error: "jobDescription is required" }, { status: 400 });
  }

  const masterResume = await prisma.masterResume.findFirst({
    where: { id, userId: user.id },
    include: {
      sections: {
        include: { experienceEntries: true, educationEntries: true, projectEntries: true, customEntries: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!masterResume) {
    return NextResponse.json({ error: "Master resume not found" }, { status: 404 });
  }

  const jd = await prisma.jobDescription.create({
    data: { userId: user.id, rawText: jobDescription, parsedKeywords: [] },
  });

  const tailoredResume = await prisma.tailoredResume.create({
    data: {
      userId: user.id,
      masterResumeId: id,
      title: `Tailored - ${new Date().toLocaleDateString()}`,
      sourceJobDescriptionId: jd.id,
      status: "ready",
    },
  });

  for (const section of masterResume.sections) {
    const newSection = await prisma.resumeSection.create({
      data: {
        tailoredResumeId: tailoredResume.id,
        type: section.type,
        order: section.order,
        visible: section.visible,
        name: section.name,
      },
    });

    for (const exp of section.experienceEntries) {
      await prisma.experienceEntry.create({
        data: {
          sectionId: newSection.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          bullets: exp.bullets,
          order: exp.order,
        },
      });
    }
    for (const edu of section.educationEntries) {
      await prisma.educationEntry.create({
        data: {
          sectionId: newSection.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          bullets: edu.bullets,
          order: edu.order,
        },
      });
    }
    for (const proj of section.projectEntries) {
      await prisma.projectEntry.create({
        data: {
          sectionId: newSection.id,
          name: proj.name,
          description: proj.description,
          url: proj.url,
          startDate: proj.startDate,
          endDate: proj.endDate,
          bullets: proj.bullets,
          order: proj.order,
        },
      });
    }
  }

  await prisma.trackerCard.create({
    data: {
      userId: user.id,
      jobDescriptionId: jd.id,
      resumeId: tailoredResume.id,
      status: "Saved",
      company: "",
      jobTitle: "",
    },
  });

  return NextResponse.json({
    id: tailoredResume.id,
    message: "Tailored resume created. The AI refinement passes are simulated — wire in your LLM provider in Settings to generate real content.",
    diff: {
      added: ["Job-tailored version created"],
      changed: [],
      removed: [],
    },
  });
}
