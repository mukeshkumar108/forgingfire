import { z } from "zod";

export const registerDeviceSchema = z.object({
  platform: z.enum(["ios", "android", "web"]),
  pushToken: z.string().trim().min(1).max(2048),
  appVersion: z.string().trim().min(1).max(64).optional(),
}).strict();

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
