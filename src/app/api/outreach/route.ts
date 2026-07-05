import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) return NextResponse.json({ error: "resumeId required" }, { status: 400 });

  const messages = await prisma.outreachMessage.findMany({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(user);

  const body = await request.json();
  const { resumeId, content, language, type } = body;

  if (!resumeId || !content) {
    return NextResponse.json({ error: "resumeId and content required" }, { status: 400 });
  }

  const message = await prisma.outreachMessage.create({
    data: { resumeId, content, language: language || "en", type: type || "linkedin" },
  });

  return NextResponse.json({ message });
}
