import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { resumeId, content, language } = body;

  if (!resumeId || !content) {
    return NextResponse.json({ error: "resumeId and content required" }, { status: 400 });
  }

  const coverLetter = await prisma.coverLetter.create({
    data: { resumeId, content, language: language || "en" },
  });

  return NextResponse.json({ coverLetter });
}

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) return NextResponse.json({ error: "resumeId required" }, { status: 400 });

  const coverLetters = await prisma.coverLetter.findMany({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coverLetters });
}
