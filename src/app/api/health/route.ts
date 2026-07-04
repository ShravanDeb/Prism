import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [masterCount, tailoredCount, jobCount, trackerCount, settings] = await Promise.all([
      prisma.masterResume.count({ where: { userId: user.id } }),
      prisma.tailoredResume.count({ where: { userId: user.id } }),
      prisma.jobDescription.count({ where: { userId: user.id } }),
      prisma.trackerCard.count({ where: { userId: user.id } }),
      prisma.settings.findUnique({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      db: "ok",
      masterResume: masterCount > 0 ? "ready" : "missing",
      resumeCount: masterCount + tailoredCount,
      jobCount,
      trackerCount,
      llmConfigured: !!(settings?.apiKeyEncrypted),
      llmProvider: settings?.llmProvider || "not configured",
    });
  } catch (error) {
    return NextResponse.json({ db: "error", error: String(error) }, { status: 500 });
  }
}
