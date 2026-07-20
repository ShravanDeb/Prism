import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { ERRORS } from "@/lib/errors";

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

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });
    await syncUser(user);

    const resumes = await prisma.masterResume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, templateId: true, status: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ resumes });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });
    await syncUser(user);

    const body = await request.json();

    const resume = await prisma.masterResume.create({
      data: {
        userId: user.id,
        title: body.title || "Untitled Resume",
        templateId: body.templateId || "classic",
        pageSize: body.pageSize || "A4",
        accentColor: body.accentColor || "#1a1a1a",
        status: "draft",
        personalInfo: body.personalInfo || undefined,
      },
      include: INCLUDE,
    });

    return NextResponse.json({ resume });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
