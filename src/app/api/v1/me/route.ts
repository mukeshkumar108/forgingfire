import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { authGuard } from "@/lib/auth/auth-guard";
import { toUserDTO } from "@/modules/users/users.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authGuard(request);
  if (!auth.ok) return auth.response;

  return apiSuccess(toUserDTO(auth.context.user));
}
