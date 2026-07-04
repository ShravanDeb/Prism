import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { encrypt, decrypt } from "@/lib/encryption";
import { complete } from "@/lib/llm-client";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  let settings = await prisma.settings.findUnique({ where: { userId: user.id } });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId: user.id },
    });
  }

  return NextResponse.json({
    ...settings,
    apiKeyEncrypted: settings.apiKeyEncrypted ? "••••••••" : null,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const body = await request.json();
  const updateData: any = {};

  const allowedFields = [
    "llmProvider", "model", "apiBaseUrl", "reasoningEffort",
    "uiLanguage", "contentLanguage", "defaultImprovementStyle",
    "coverLetterEnabled", "outreachEnabled", "customPrompts",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (body.apiKey) {
    updateData.apiKeyEncrypted = await encrypt(body.apiKey);
  }

  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: updateData,
    create: { userId: user.id, ...updateData },
  });

  return NextResponse.json({
    ...settings,
    apiKeyEncrypted: settings.apiKeyEncrypted ? "••••••••" : null,
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const body = await request.json();

  if (body.action === "test-connection") {
    const settings = await prisma.settings.findUnique({ where: { userId: user.id } });
    if (!settings?.apiKeyEncrypted) {
      return NextResponse.json({ success: false, error: "No API key configured" });
    }

    try {
      const apiKey = await decrypt(settings.apiKeyEncrypted);
      const result = await complete(
        {
          provider: settings.llmProvider as any,
          model: settings.model,
          apiKey,
          apiBaseUrl: settings.apiBaseUrl || undefined,
        },
        {
          messages: [{ role: "user", content: "Reply with exactly: OK" }],
          maxTokens: 10,
        }
      );
      return NextResponse.json({ success: true, response: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message });
    }
  }

  if (body.action === "clear-keys") {
    await prisma.settings.update({
      where: { userId: user.id },
      data: { apiKeyEncrypted: null },
    });
    return NextResponse.json({ success: true });
  }

  if (body.action === "reset-db") {
    await prisma.trackerCard.deleteMany({ where: { userId: user.id } });
    await prisma.jobDescription.deleteMany({ where: { userId: user.id } });
    await prisma.coverLetter.deleteMany({ where: { resume: { userId: user.id } } });
    await prisma.outreachMessage.deleteMany({ where: { resume: { userId: user.id } } });
    await prisma.enrichmentSession.deleteMany({ where: { resume: { userId: user.id } } });
    await prisma.tailoredResume.deleteMany({ where: { userId: user.id } });
    await prisma.masterResume.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
