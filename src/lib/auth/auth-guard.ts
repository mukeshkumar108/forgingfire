import { getAuth } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";
import { apiError } from "@/lib/api/response";
import { ensureUserProvisioned } from "@/modules/users/users.service";

type AuthContext = {
  clerkUserId: string;
  user: Awaited<ReturnType<typeof ensureUserProvisioned>>;
};

type AuthGuardResult =
  | { ok: true; context: AuthContext }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function authGuard(request: NextRequest): Promise<AuthGuardResult> {
  const authHeader = request.headers.get("authorization");
  const hasAuthorizationHeader = Boolean(authHeader);
  const hasBearerToken = Boolean(authHeader?.trim().toLowerCase().startsWith("bearer "));

  if (hasAuthorizationHeader && !hasBearerToken) {
    return {
      ok: false,
      response: apiError(401, "authorization header must be a bearer token", "INVALID_AUTH_HEADER"),
    };
  }

  const auth = getAuth(request, {
    acceptsToken: "session_token",
  });

  if (!auth.userId) {
    const code = hasBearerToken ? "INVALID_BEARER_TOKEN" : "UNAUTHORIZED";
    const message = hasBearerToken ? "invalid bearer token" : "authentication required";
    return {
      ok: false,
      response: apiError(401, message, code),
    };
  }

  try {
    const user = await ensureUserProvisioned(auth.userId);

    return {
      ok: true,
      context: {
        clerkUserId: auth.userId,
        user,
      },
    };
  } catch {
    return {
      ok: false,
      response: apiError(500, "failed to provision application user", "USER_PROVISION_FAILED"),
    };
  }
}
