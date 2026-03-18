import { apiError, apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return apiSuccess({
      status: "ok",
      database: "up",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiError(503, "database connectivity check failed", "DB_UNAVAILABLE");
  }
}
