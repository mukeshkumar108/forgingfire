import { describe, expect, it, vi } from "vitest";
import { registerDevice } from "@/modules/devices/devices.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    device: {
      upsert: vi.fn(),
    },
  },
}));

const upsertMock = vi.mocked(prisma.device.upsert);

describe("devices.service registerDevice", () => {
  it("creates new device record", async () => {
    upsertMock.mockResolvedValueOnce({
      id: "dev_1",
      pushToken: "token_1",
    } as never);

    const result = await registerDevice("user_1", {
      platform: "ios",
      pushToken: "token_1",
      appVersion: "1.0.0",
    });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pushToken: "token_1" },
        create: expect.objectContaining({
          userId: "user_1",
          pushToken: "token_1",
        }),
      }),
    );
    expect(result).toMatchObject({ id: "dev_1" });
  });

  it("updates same token idempotently", async () => {
    upsertMock.mockResolvedValueOnce({
      id: "dev_1",
      pushToken: "token_1",
      appVersion: "1.0.1",
    } as never);

    const result = await registerDevice("user_1", {
      platform: "ios",
      pushToken: "token_1",
      appVersion: "1.0.1",
    });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pushToken: "token_1" },
        update: expect.objectContaining({ appVersion: "1.0.1" }),
      }),
    );
    expect(result).toMatchObject({ id: "dev_1", pushToken: "token_1" });
  });
});
