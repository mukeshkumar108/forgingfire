import { prisma } from "@/lib/prisma";
import { userPreferencesSchema } from "@/modules/users/users.schemas";

export async function getUserNotificationPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const parsed = userPreferencesSchema.safeParse(user?.preferences ?? {});
  const preferences = parsed.success ? parsed.data : userPreferencesSchema.parse({});

  return preferences.notifications;
}
