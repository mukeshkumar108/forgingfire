import { z } from "zod";

// Env module: centralizes boot-time validation so config errors fail fast.
// Keep all process.env access here so other modules use typed values only.
// To add a new variable, declare it in the schema below and in .env.example.

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  POSTGRES_PRISMA_URL: z.string().min(1),
  POSTGRES_URL_NON_POOLING: z.string().min(1),
  // Feature-specific values are optional at boot and validated when used.
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
});

const skipEnvValidation = process.env.SKIP_ENV_VALIDATION === "1";
const parsedEnv = skipEnvValidation
  ? envSchema.partial().parse(process.env)
  : envSchema.parse(process.env);

export const env = parsedEnv as z.infer<typeof envSchema>;

export function getBlobReadWriteToken() {
  return z.string().min(1).parse(env.BLOB_READ_WRITE_TOKEN);
}

export function getClerkWebhookSecret() {
  return z.string().min(1).parse(env.CLERK_WEBHOOK_SECRET);
}
