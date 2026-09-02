import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1).max(80),
});

export const courseTagSchema = z.object({
  subjectId: z.string().min(1),
});

export const trainerSubjectSchema = z.object({
  trainerId: z.string().min(1),
  subjectId: z.string().min(1),
  rating: z.number().int().min(0).max(100).default(0),
});