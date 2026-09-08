import { describe, it, expect } from "vitest";
import {
  signupSchema,
  contactSchema,
  resetPasswordSchema,
  updateUserRoleSchema,
} from "./auth";

describe("signupSchema", () => {
  it("normalises email casing and surrounding whitespace", () => {
    const result = signupSchema.parse({
      name: "  Ada  ",
      email: "  Ada@Example.COM ",
      password: "correct horse",
    });
    expect(result.email).toBe("ada@example.com");
    expect(result.name).toBe("Ada");
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed emails", () => {
    const result = signupSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      password: "longenough1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string payloads that would previously pass a truthiness check", () => {
    const result = signupSchema.safeParse({
      name: { toString: "evil" },
      email: "ada@example.com",
      password: "longenough1",
    });
    expect(result.success).toBe(false);
  });

  it("only allows self-service signup as TRAINEE or TRAINER", () => {
    expect(
      signupSchema.safeParse({
        name: "Ada",
        email: "ada@example.com",
        password: "longenough1",
        role: "ADMIN",
      }).success
    ).toBe(false);
  });
});

describe("contactSchema", () => {
  it("rejects an oversized message body", () => {
    const result = contactSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      subject: "Hi",
      message: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects blank whitespace-only fields", () => {
    const result = contactSchema.safeParse({
      name: "   ",
      email: "ada@example.com",
      subject: "Hi",
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("enforces the same 8-character minimum as signup", () => {
    expect(
      resetPasswordSchema.safeParse({ token: "abc", password: "short" }).success
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ token: "abc", password: "longenough1" }).success
    ).toBe(true);
  });
});

describe("updateUserRoleSchema", () => {
  it("accepts known roles", () => {
    expect(
      updateUserRoleSchema.safeParse({ userId: "u1", role: "TRAINER" }).success
    ).toBe(true);
  });

  it("rejects arbitrary role strings", () => {
    expect(
      updateUserRoleSchema.safeParse({ userId: "u1", role: "SUPERUSER" }).success
    ).toBe(false);
  });
});
