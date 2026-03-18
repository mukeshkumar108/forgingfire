import { z } from "zod";

export const userPreferencesSchema = z.object({
  notifications: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(true),
  }).default({
    push: true,
    email: true,
  }),
  communications: z.object({
    marketing: z.boolean().default(false),
  }).default({
    marketing: false,
  }),
  privacy: z.object({
    analytics: z.boolean().default(true),
  }).default({
    analytics: true,
  }),
});

const usernameSchema = z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_.]+$/);
const shortTextSchema = z.string().trim().min(1).max(120);
const optionalProfileTextSchema = z.union([shortTextSchema, z.null()]);

export const updateMeSchema = z.object({
  profile: z.object({
    username: z.union([usernameSchema, z.null()]).optional(),
    displayName: optionalProfileTextSchema.optional(),
    firstName: optionalProfileTextSchema.optional(),
    lastName: optionalProfileTextSchema.optional(),
    bio: z.union([z.string().trim().min(1).max(280), z.null()]).optional(),
    imageUrl: z.union([z.string().trim().url().max(2048), z.null()]).optional(),
    timezone: z.union([z.string().trim().min(1).max(64), z.null()]).optional(),
    locale: z.union([z.string().trim().min(2).max(35), z.null()]).optional(),
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      push: z.boolean().optional(),
      email: z.boolean().optional(),
    }).optional(),
    communications: z.object({
      marketing: z.boolean().optional(),
    }).optional(),
    privacy: z.object({
      analytics: z.boolean().optional(),
    }).optional(),
  }).optional(),
  onboarding: z.object({
    completed: z.boolean().optional(),
  }).optional(),
}).refine(
  (value) => Boolean(value.profile || value.preferences || value.onboarding),
  { message: "at least one section is required" },
);

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
