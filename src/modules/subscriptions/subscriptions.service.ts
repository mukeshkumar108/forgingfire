import { prisma } from "@/lib/prisma";

export type Entitlements = {
  isPro: boolean;
  plan: "free" | "pro";
  status: "active" | "trialing" | "none";
};

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "trialing"],
      },
    },
    orderBy: [
      { currentPeriodEnd: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });
}

export async function resolveEntitlements(userId: string): Promise<Entitlements> {
  const subscription = await getActiveSubscription(userId);

  if (subscription?.status === "active") {
    return {
      isPro: true,
      plan: "pro",
      status: "active",
    };
  }

  if (subscription?.status === "trialing") {
    return {
      isPro: true,
      plan: "pro",
      status: "trialing",
    };
  }

  return {
    isPro: false,
    plan: "free",
    status: "none",
  };
}

export async function getUserEntitlements(userId: string): Promise<Entitlements> {
  return resolveEntitlements(userId);
}
