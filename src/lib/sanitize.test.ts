import { describe, it, expect } from "vitest";
import {
  sanitizeAnnouncementTitle,
  sanitizeAnnouncementContent,
  sanitizeComment,
  escapeHtml,
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

describe("escapeHtml", () => {
  it("neutralises tags so injected markup cannot execute", () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("escapes attribute-breaking quotes", () => {
    expect(escapeHtml(`" onmouseover='x'`)).toBe(
      "&quot; onmouseover=&#39;x&#39;"
    );
  });

  it("escapes ampersands first so entities are not double-decoded", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("Hello there, world 123")).toBe("Hello there, world 123");
  });
});
