import { z } from "zod";

const canonicalLocale = (value: string) => {
  try {
    return Intl.getCanonicalLocales(value)[0] ?? value;
  } catch {
    return value;
  }
};

const isValidLocale = (value: string) => {
  try {
    return Intl.getCanonicalLocales(value).length > 0;
  } catch {
    return false;
  }
};

const hasSupportedValuesOf =
  typeof Intl.supportedValuesOf === "function";

const isValidTimezone = (value: string) => {
  if (!hasSupportedValuesOf) return true;
  return Intl.supportedValuesOf("timeZone").includes(value);
};

const nullableTrimmedString = (max: number) =>
  z.union([
    z.string().trim().max(max).transform((v) => (v === "" ? null : v)),
    z.null(),
  ]);

const nullableUrlString = z.union([
  z.string().trim().max(2048).transform((v, ctx) => {
    if (v === "") return null;
    try {
      new URL(v);
      return v;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "invalid URL",
      });
      return z.NEVER;
    }
  }),
  z.null(),
]);

export const userPreferencesSchema = z.object({
  notifications: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(true),
  }).strict().default({
    push: true,
    email: true,
  }),
  communications: z.object({
    marketing: z.boolean().default(false),
  }).strict().default({
    marketing: false,
  }),
  privacy: z.object({
    analytics: z.boolean().default(true),
  }).strict().default({
    analytics: true,
  }),
}).strict();

const usernameSchema = z.string().trim().min(3).max(32).regex(/^[a-z0-9._]+$/);
const normalizedUsernameSchema = z.union([
  z.string().trim().toLowerCase().pipe(usernameSchema),
  z.null(),
]);

export const updateMeSchema = z.object({
  profile: z.object({
    username: normalizedUsernameSchema.optional(),
    displayName: nullableTrimmedString(120).optional(),
    firstName: nullableTrimmedString(80).optional(),
    lastName: nullableTrimmedString(80).optional(),
    bio: nullableTrimmedString(280).optional(),
    imageUrl: nullableUrlString.optional(),
    timezone: z.union([
      z.string().trim().min(1).max(64).refine(isValidTimezone, "invalid timezone"),
      z.null(),
    ]).optional(),
    locale: z.union([
      z.string().trim().min(2).max(35).transform(canonicalLocale).refine(isValidLocale, "invalid locale"),
      z.null(),
    ]).optional(),
  }).strict().optional(),
  preferences: z.object({
    notifications: z.object({
      push: z.boolean().optional(),
      email: z.boolean().optional(),
    }).strict().optional(),
    communications: z.object({
      marketing: z.boolean().optional(),
    }).strict().optional(),
    privacy: z.object({
      analytics: z.boolean().optional(),
    }).strict().optional(),
  }).strict().optional(),
  onboarding: z.object({
    completed: z.literal(true).optional(),
  }).strict().optional(),
}).strict().refine(
  (value) => Boolean(value.profile || value.preferences || value.onboarding),
  { message: "at least one section is required" },
);

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
