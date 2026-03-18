import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateJsonBody } from "@/lib/api/validation";
import { authGuard } from "@/lib/auth/auth-guard";
import { registerDeviceSchema } from "@/modules/devices/devices.schemas";
import { registerDevice, toDeviceDTO } from "@/modules/devices/devices.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authGuard(request);
  if (!auth.ok) return auth.response;

  const parsedBody = await validateJsonBody(request, registerDeviceSchema);
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const device = await registerDevice(auth.context.user.id, parsedBody.data);
    return apiSuccess(toDeviceDTO(device));
  } catch {
    return apiError(500, "failed to register device", "DEVICE_REGISTRATION_FAILED");
  }
}
