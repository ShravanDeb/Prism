import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const cards = await prisma.trackerCard.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      jobDescription: { select: { rawText: true, parsedKeywords: true } },
      tailoredResume: { select: { title: true } },
    },
  });

  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const body = await request.json();

  let jdId = body.jobDescriptionId;
  if (body.jdText && !jdId) {
    const jd = await prisma.jobDescription.create({
      data: { userId: user.id, rawText: body.jdText, parsedKeywords: [] },
    });
    jdId = jd.id;
  }

  const card = await prisma.trackerCard.create({
    data: {
      userId: user.id,
      jobDescriptionId: jdId || null,
      resumeId: body.resumeId || null,
      status: body.status || "Saved",
      notes: body.notes || null,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
    },
  });

  return NextResponse.json({ card });
}
