import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type UserDTO = {
  id: string;
  clerkUserId: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getUserByClerkId(clerkUserId: string) {
  return prisma.user.findUnique({
    where: { clerkUserId },
  });
}

export async function upsertUser(params: {
  clerkUserId: string;
  email?: string | null;
}) {
  const { clerkUserId, email } = params;

  return prisma.user.upsert({
    where: { clerkUserId },
    update: { email: email ?? undefined },
    create: { clerkUserId, email: email ?? undefined },
  });
}

export async function ensureUserProvisioned(clerkUserId: string) {
  const existing = await getUserByClerkId(clerkUserId);
  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  return upsertUser({
    clerkUserId,
    email: primaryEmail,
  });
}

export function toUserDTO(user: {
  id: string;
  clerkUserId: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserDTO {
  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
