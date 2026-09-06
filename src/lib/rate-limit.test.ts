import { describe, it, expect } from "vitest";
import { rateLimit, getClientIp } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the configured limit", () => {
    const key = `test-rl-${Date.now()}`;
    const res1 = rateLimit(key, { limit: 2, windowMs: 1000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = rateLimit(key, { limit: 2, windowMs: 1000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);

    const res3 = rateLimit(key, { limit: 2, windowMs: 1000 });
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);
  });
});

describe("getClientIp", () => {
  it("extracts client IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost:3000", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("extracts client IP from x-real-ip header", () => {
    const req = new Request("http://localhost:3000", {
      headers: { "x-real-ip": "198.51.100.42" },
    });
    expect(getClientIp(req)).toBe("198.51.100.42");
  });

  it("falls back to 127.0.0.1 when no IP headers present", () => {
    const req = new Request("http://localhost:3000");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
