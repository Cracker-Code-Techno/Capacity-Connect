import { z } from "zod";

export const socialLinksSchema = z
  .object({
    linkedin: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    site: z.string().url().optional().or(z.literal("")),
  })
  .partial();

export const qualificationSchema = z.object({
  title: z.string().min(1).max(200),
  institution: z.string().min(1).max(200),
  year: z.number().int().min(1900).max(2100),
});

export const experienceSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  start: z.string().min(1).max(50),
  end: z.string().min(1).max(50),
  description: z.string().max(2000).optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  year: z.number().int().min(1900).max(2100),
  fileUrl: z.string().url().optional().or(z.literal("")),
});

export const traineeProfileSchema = z.object({
  bio: z.string().max(2000).optional().or(z.literal("")),
  headline: z.string().max(200).optional().or(z.literal("")),
  interests: z.array(z.string().min(1).max(80)).max(50).default([]),
  skills: z.array(z.string().min(1).max(80)).max(100).default([]),
  qualifications: z.array(qualificationSchema).max(50).default([]),
  experience: z.array(experienceSchema).max(50).default([]),
  certificates: z.array(certificateSchema).max(50).default([]),
});

export const trainerProfileSchema = z.object({
  bio: z.string().max(2000).optional().or(z.literal("")),
  headline: z.string().max(200).optional().or(z.literal("")),
  yearsExperience: z.number().int().min(0).max(80).optional().nullable(),
  hourlyRate: z.number().min(0).max(10000).optional().nullable(),
  socialLinks: socialLinksSchema.optional(),
});

export type TraineeProfileInput = z.infer<typeof traineeProfileSchema>;
export type TrainerProfileInput = z.infer<typeof trainerProfileSchema>;