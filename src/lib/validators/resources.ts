import { z } from "zod";

export const RESOURCE_TYPES = ["lecture", "presentation", "material"] as const;

export const trainerResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  type: z.enum(RESOURCE_TYPES),
  fileUrl: z.string().min(1).max(2000),
  fileSize: z.number().int().min(1).max(25 * 1024 * 1024),
  mimeType: z.string().min(1).max(200),
});

export const courseResourceSchema = trainerResourceSchema.extend({
  order: z.number().int().min(0).max(1000).default(0),
});

export const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/x-iwork-keynote-sffkey",
  "image/jpeg",
  "image/png",
];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;