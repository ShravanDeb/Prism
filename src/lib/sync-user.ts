import { prisma } from "./prisma";
import type { User } from "@supabase/supabase-js";

export async function syncUser(supabaseUser: User) {
  const existing = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { id: true },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name: supabaseUser.user_metadata?.full_name ?? null,
      },
    });
  }
}
