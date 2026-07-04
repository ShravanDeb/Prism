import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const body = await request.json();

  const masterResume = await prisma.masterResume.findFirst({ where: { id, userId: user.id } });
  if (masterResume) {
    const updated = await prisma.masterResume.update({ where: { id }, data: body });
    return NextResponse.json({ resume: updated });
  }

  const tailoredResume = await prisma.tailoredResume.findFirst({ where: { id, userId: user.id } });
  if (tailoredResume) {
    const updated = await prisma.tailoredResume.update({ where: { id }, data: body });
    return NextResponse.json({ resume: updated });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.masterResume.deleteMany({ where: { id, userId: user.id } });
    await prisma.tailoredResume.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
