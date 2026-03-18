import { type Device } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type RegisterDeviceInput } from "./devices.schemas";

export type DeviceDTO = {
  id: string;
  userId: string;
  platform: "ios" | "android" | "web";
  pushToken: string;
  appVersion: string | null;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
};

export async function registerDevice(userId: string, input: RegisterDeviceInput) {
  const now = new Date();
  const pushToken = input.pushToken.trim();

  return prisma.device.upsert({
    where: { pushToken },
    update: {
      userId,
      platform: input.platform,
      appVersion: input.appVersion,
      lastSeenAt: now,
    },
    create: {
      userId,
      platform: input.platform,
      pushToken,
      appVersion: input.appVersion,
      lastSeenAt: now,
    },
  });
}

export function toDeviceDTO(device: Device): DeviceDTO {
  return {
    id: device.id,
    userId: device.userId,
    platform: device.platform,
    pushToken: device.pushToken,
    appVersion: device.appVersion,
    lastSeenAt: device.lastSeenAt.toISOString(),
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  };
}
