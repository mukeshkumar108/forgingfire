import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/auth-guard", () => ({
  authGuard: vi.fn(async () => ({
    ok: true,
    context: {
      user: { id: "user_1" },
    },
  })),
}));

vi.mock("@/modules/users/users.service", () => ({
  toUserDTO: vi.fn(() => ({
    id: "user_1",
    clerkUserId: "clerk_1",
    email: "test@example.com",
    profile: {
      username: "alice",
      displayName: "Alice",
      firstName: "Alice",
      lastName: "Doe",
      bio: null,
      imageUrl: null,
      timezone: "Europe/London",
      locale: "en-GB",
    },
    preferences: {
      notifications: { push: true, email: true },
      communications: { marketing: false },
      privacy: { analytics: true },
    },
    onboarding: { completed: false, completedAt: null },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
  updateMe: vi.fn(),
}));

vi.mock("@/modules/subscriptions/subscriptions.service", () => ({
  getUserEntitlements: vi.fn(async () => ({
    isPro: true,
    plan: "pro",
    status: "active",
  })),
}));

import { GET } from "@/app/api/v1/me/route";

describe("GET /api/v1/me", () => {
  it("returns expected structure", async () => {
    const request = new NextRequest("https://example.com/api/v1/me");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toMatchObject({
      success: true,
      error: null,
      data: {
        profile: expect.any(Object),
        preferences: expect.any(Object),
        onboarding: expect.any(Object),
        subscription: {
          isPro: true,
          plan: "pro",
          status: "active",
        },
      },
    });
  });
});
