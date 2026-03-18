import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authGuard } from "@/lib/auth/auth-guard";
import { getAuth } from "@clerk/nextjs/server";
import { ensureUserProvisioned } from "@/modules/users/users.service";

vi.mock("@clerk/nextjs/server", () => ({
  getAuth: vi.fn(),
}));

vi.mock("@/modules/users/users.service", () => ({
  ensureUserProvisioned: vi.fn(),
}));

const getAuthMock = vi.mocked(getAuth);
const ensureUserProvisionedMock = vi.mocked(ensureUserProvisioned);

describe("authGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing auth header", async () => {
    getAuthMock.mockReturnValue({ userId: null } as never);

    const request = new NextRequest("https://example.com/api/v1/me");
    const result = await authGuard(request);

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
  });

  it("rejects invalid bearer header format", async () => {
    const request = new NextRequest("https://example.com/api/v1/me", {
      headers: { Authorization: "Token abc" },
    });

    const result = await authGuard(request);

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "INVALID_AUTH_HEADER" },
    });
    expect(getAuthMock).not.toHaveBeenCalled();
  });

  it("accepts valid bearer auth", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_1" } as never);
    ensureUserProvisionedMock.mockResolvedValue({ id: "user_1" } as never);

    const request = new NextRequest("https://example.com/api/v1/me", {
      headers: { Authorization: "Bearer token" },
    });

    const result = await authGuard(request);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.context.clerkUserId).toBe("clerk_1");
    expect(result.context.user).toMatchObject({ id: "user_1" });
  });
});
