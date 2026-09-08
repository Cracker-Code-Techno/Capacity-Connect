import { z } from "zod";

/** Shared password policy — kept in one place so signup and reset never drift. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(200, "Password must be at most 200 characters.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["TRAINEE", "TRAINER"]).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(200),
  password: passwordSchema,
});

/** Roles an admin is allowed to assign. */
export const ASSIGNABLE_ROLES = [
  "TRAINEE",
  "TRAINER",
  "PENDING_TRAINER",
  "ADMIN",
] as const;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1).max(64),
  role: z.enum(ASSIGNABLE_ROLES),
});
