import { z } from "zod";

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;