import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { validateJsonBody } from "@/lib/api/validation";
import { authGuard } from "@/lib/auth/auth-guard";
import { toUserDTO, updateMe } from "@/modules/users/users.service";
import { updateMeSchema } from "@/modules/users/users.schemas";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authGuard(request);
  if (!auth.ok) return auth.response;

  return apiSuccess(toUserDTO(auth.context.user));
}

export async function PATCH(request: NextRequest) {
  const auth = await authGuard(request);
  if (!auth.ok) return auth.response;

  const parsedBody = await validateJsonBody(request, updateMeSchema);
  if (!parsedBody.ok) return parsedBody.response;

  try {
    const updated = await updateMe(auth.context.user.id, parsedBody.data);
    return apiSuccess(toUserDTO(updated));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError(409, "username is already taken", "USERNAME_TAKEN");
    }

    return apiError(500, "failed to update user", "USER_UPDATE_FAILED");
  }
}
