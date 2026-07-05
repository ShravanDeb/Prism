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
  const { sections: selectedSections, instruction } = body;

  if (!Array.isArray(selectedSections) || selectedSections.length === 0) {
    return NextResponse.json({ error: "sections must be a non-empty array" }, { status: 400 });
  }

  const resume = await prisma.masterResume.findFirst({
    where: { id, userId: user.id },
    include: {
      sections: {
        include: { experienceEntries: true, educationEntries: true, projectEntries: true, customEntries: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({
    resume,
    message: instruction
      ? `AI regeneration requested for: ${selectedSections.join(", ")}. Instruction: "${instruction}". Configure an LLM provider in Settings to enable real AI generation.`
      : `AI regeneration requested for: ${selectedSections.join(", ")}. Configure an LLM provider in Settings to enable real AI generation.`,
  });
}
