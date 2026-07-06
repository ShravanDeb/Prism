import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

function generateCoverLetter(resume: any): string {
  const piSection = resume.sections?.find((s: any) => s.type === "personal_info");
  const piEntry = piSection?.customEntries?.[0];
  let piData: Record<string, string> = {};
  if (piEntry?.content) {
    try { piData = JSON.parse(piEntry.content); } catch {}
  }
  const name = piData.name || resume.title || "Your Name";
  const email = piData.email || "";
  const phone = piData.phone || "";
  const contactLine = [email, phone].filter(Boolean).join(" | ");

  const expSection = resume.sections?.find((s: any) => s.type === "experience");
  const expEntries = expSection?.experienceEntries || [];
  const expSummary = expEntries.length > 0
    ? `I have experience as ${expEntries.map((e: any) => e.title).filter(Boolean).join(", ")}.`
    : "My professional background aligns well with the requirements of this role.";

  return `${name}${contactLine ? `\n${contactLine}` : ""}

Dear Hiring Manager,

I am writing to express my interest in the position at your company. ${expSummary}

Throughout my career, I have developed strong skills that make me a valuable asset to any team. My experience has prepared me to hit the ground running and deliver results from day one.

I welcome the opportunity to discuss how my qualifications can contribute to your team's success. Thank you for your consideration.

Sincerely,
${name}`;
}

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

  const wantsCoverLetter = selectedSections.includes("cover_letter");

  return NextResponse.json({
    resume: wantsCoverLetter ? undefined : resume,
    ...(wantsCoverLetter ? { coverLetter: generateCoverLetter(resume) } : { resume }),
    message: wantsCoverLetter
      ? "Cover letter generated from your resume data. Edit as needed."
      : instruction
        ? `AI regeneration requested for: ${selectedSections.join(", ")}. Instruction: "${instruction}". Configure an LLM provider in Settings to enable real AI generation.`
        : `AI regeneration requested for: ${selectedSections.join(", ")}. Configure an LLM provider in Settings to enable real AI generation.`,
  });
}
