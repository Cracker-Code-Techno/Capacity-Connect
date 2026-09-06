import { describe, it, expect } from "vitest";
import {
  sanitizeAnnouncementTitle,
  sanitizeAnnouncementContent,
  sanitizeComment,
} from "./sanitize";

describe("sanitize utilities", () => {
  it("removes script tags and inline events", () => {
    const malicious = '<script>alert("xss")</script>Hello <img src="x" onerror="evil()"/>';
    const clean = sanitizeComment(malicious);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("Hello");
  });

  it("truncates announcement title to max 200 chars", () => {
    const longTitle = "a".repeat(250);
    expect(sanitizeAnnouncementTitle(longTitle).length).toBe(200);
  });

  it("truncates announcement content to max 5000 chars", () => {
    const longContent = "c".repeat(5500);
    expect(sanitizeAnnouncementContent(longContent).length).toBe(5000);
  });
});
