import { z } from "zod";
import { apiError } from "./response";

export function validateQuery<T extends z.ZodTypeAny>(schema: T, input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: apiError(400, "invalid query parameters", "INVALID_QUERY"),
    };
  }

  return {
    ok: true as const,
    data: parsed.data as z.infer<T>,
  };
}

export async function validateJsonBody<T extends z.ZodTypeAny>(request: Request, schema: T) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      ok: false as const,
      response: apiError(400, "invalid JSON body", "INVALID_JSON"),
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: apiError(400, "invalid request body", "INVALID_BODY"),
    };
  }

  return {
    ok: true as const,
    data: parsed.data as z.infer<T>,
  };
}
