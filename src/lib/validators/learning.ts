import { z } from "zod";

export const moduleProgressSchema = z.object({
  moduleId: z.string().min(1),
  completed: z.boolean(),
});

export const attemptSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export const achievementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
});

export const homepageHighlightSchema = z.object({
  kind: z.enum(["course", "announcement", "achievement"]),
  refId: z.string().min(1),
  published: z.boolean().default(false),
  order: z.number().int().min(0).max(1000).default(0),
});

export const assessmentCreateSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1).max(200),
  dueDate: z.string().datetime().optional().nullable(),
  maxAttempts: z.number().int().min(1).max(20).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  questions: z
    .array(
      z.object({
        text: z.string().min(1).max(1000),
        options: z
          .array(
            z.object({
              text: z.string().min(1).max(500),
              isCorrect: z.boolean(),
            })
          )
          .min(2)
          .max(8),
      })
    )
    .min(1),
});