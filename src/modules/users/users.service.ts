import { Prisma } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  type UpdateMeInput,
  type UserPreferences,
  userPreferencesSchema,
} from "./users.schemas";

function normalizeUsername(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.trim().toLowerCase();
}

export type UserDTO = {
  id: string;
  clerkUserId: string;
  email: string | null;
  profile: {
    username: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    imageUrl: string | null;
    timezone: string | null;
    locale: string | null;
  };
  preferences: UserPreferences;
  onboarding: {
    completed: boolean;
    completedAt: string | null;
  };
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
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}) {
  const {
    clerkUserId,
    email,
    username,
    firstName,
    lastName,
    imageUrl,
  } = params;

  const normalizedUsername = normalizeUsername(username);

  const existing = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (existing) {
    return prisma.user.update({
      where: { clerkUserId },
      data: {
        // Clerk seeding is fallback-only for existing users:
        // fill missing core identity fields, never overwrite app-managed values.
        email: existing.email ?? email ?? undefined,
        username: existing.username ?? normalizedUsername ?? undefined,
        firstName: existing.firstName ?? firstName ?? undefined,
        lastName: existing.lastName ?? lastName ?? undefined,
        imageUrl: existing.imageUrl ?? imageUrl ?? undefined,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkUserId,
      email: email ?? undefined,
      username: normalizedUsername ?? undefined,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      imageUrl: imageUrl ?? undefined,
    },
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
    username: clerkUser.username ?? null,
    firstName: clerkUser.firstName ?? null,
    lastName: clerkUser.lastName ?? null,
    imageUrl: clerkUser.imageUrl ?? null,
  });
}

function getDefaultPreferences(): UserPreferences {
  return userPreferencesSchema.parse({});
}

function parseUserPreferences(preferences: Prisma.JsonValue | null | undefined): UserPreferences {
  const parsed = userPreferencesSchema.safeParse(preferences ?? {});
  if (!parsed.success) return getDefaultPreferences();
  return parsed.data;
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error("user not found");

  const existingPreferences = parseUserPreferences(existing.preferences);

  const mergedPreferences: UserPreferences = {
    notifications: {
      ...existingPreferences.notifications,
      ...(input.preferences?.notifications ?? {}),
    },
    communications: {
      ...existingPreferences.communications,
      ...(input.preferences?.communications ?? {}),
    },
    privacy: {
      ...existingPreferences.privacy,
      ...(input.preferences?.privacy ?? {}),
    },
  };

  const onboardingCompleted =
    input.onboarding?.completed ?? existing.onboardingCompleted;

  // Onboarding is one-way in this starter: completion can be set, not unset.
  const onboardingCompletedAt =
    input.onboarding?.completed === true
      ? existing.onboardingCompletedAt ?? new Date()
      : existing.onboardingCompletedAt;

  return prisma.user.update({
    where: { id: userId },
    data: {
      username: normalizeUsername(input.profile?.username),
      displayName: input.profile?.displayName,
      firstName: input.profile?.firstName,
      lastName: input.profile?.lastName,
      bio: input.profile?.bio,
      imageUrl: input.profile?.imageUrl,
      timezone: input.profile?.timezone,
      locale: input.profile?.locale,
      preferences: mergedPreferences,
      onboardingCompleted,
      onboardingCompletedAt,
    },
  });
}

export function toUserDTO(user: {
  id: string;
  clerkUserId: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  imageUrl: string | null;
  timezone: string | null;
  locale: string | null;
  preferences: Prisma.JsonValue;
  onboardingCompleted: boolean;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): UserDTO {
  const preferences = parseUserPreferences(user.preferences);

  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    profile: {
      username: user.username,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      imageUrl: user.imageUrl,
      timezone: user.timezone,
      locale: user.locale,
    },
    preferences,
    onboarding: {
      completed: user.onboardingCompleted,
      completedAt: user.onboardingCompletedAt?.toISOString() ?? null,
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
