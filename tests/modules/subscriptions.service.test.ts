import { describe, expect, it, vi } from "vitest";
import { resolveEntitlements } from "@/modules/subscriptions/subscriptions.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findFirst: vi.fn(),
    },
  },
}));

const findFirstMock = vi.mocked(prisma.subscription.findFirst);

describe("subscriptions entitlements", () => {
  it("active -> isPro true", async () => {
    findFirstMock.mockResolvedValueOnce({ status: "active" } as never);

    const result = await resolveEntitlements("user_1");

    expect(result).toEqual({ isPro: true, plan: "pro", status: "active" });
  });

  it("trialing -> isPro true", async () => {
    findFirstMock.mockResolvedValueOnce({ status: "trialing" } as never);

    const result = await resolveEntitlements("user_1");

    expect(result).toEqual({ isPro: true, plan: "pro", status: "trialing" });
  });

  it("none -> isPro false", async () => {
    findFirstMock.mockResolvedValueOnce(null);

    const result = await resolveEntitlements("user_1");

    expect(result).toEqual({ isPro: false, plan: "free", status: "none" });
  });
});
