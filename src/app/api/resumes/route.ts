import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { ERRORS } from "@/lib/errors";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });

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

    const body = await request.json();

    if (body.type === "master") {
      const resume = await prisma.masterResume.create({
        data: {
          userId: user.id,
          title: body.title || "Master Resume",
          status: "ready",
        },
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
