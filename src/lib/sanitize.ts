export function sanitizeText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on(error|load|click|mouseover)\s*=/gi, "")
    .trim();
}

export function sanitizeAnnouncementTitle(input: string): string {
  return sanitizeText(input).substring(0, 200);
}

export function sanitizeAnnouncementContent(input: string): string {
  return sanitizeText(input).substring(0, 5000);
}

export function sanitizeComment(input: string): string {
  return sanitizeText(input).substring(0, 1000);
}