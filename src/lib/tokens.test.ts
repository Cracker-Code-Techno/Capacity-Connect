import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the prisma singleton
vi.mock("./prisma", () => ({
  prisma: {
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    emailVerificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "./prisma";
import {
  createPasswordResetToken,
  validatePasswordResetToken,
  deleteAllPasswordResetTokens,
  createEmailVerificationToken,
  validateEmailVerificationToken,
  deleteAllEmailVerificationTokens,
} from "./tokens";

describe("tokens utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Password Reset Tokens", () => {
    it("creates a password reset token with normalized email and prunes expired tokens", async () => {
      vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
        id: "token-1",
        email: "user@example.com",
        token: "hex123",
        expires: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      });

      const token = await createPasswordResetToken("  User@Example.COM  ");

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBe(64); // 32 hex bytes

      // Check expired tokens are pruned
      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { expires: { lt: expect.any(Date) } },
      });

      // Check created with normalized email
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          email: "user@example.com",
          token: expect.any(String),
          expires: expect.any(Date),
        },
      });
    });

    it("validates an unexpired password reset token and returns normalized email", async () => {
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
        id: "token-1",
        email: "User@Example.com",
        token: "valid-token",
        expires: new Date(Date.now() + 1800000), // +30 mins
        createdAt: new Date(),
      });

      const email = await validatePasswordResetToken("valid-token");
      expect(email).toBe("user@example.com");
    });

    it("returns null for an expired password reset token", async () => {
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
        id: "token-1",
        email: "user@example.com",
        token: "expired-token",
        expires: new Date(Date.now() - 1000), // expired 1s ago
        createdAt: new Date(),
      });

      const email = await validatePasswordResetToken("expired-token");
      expect(email).toBeNull();
    });

    it("deletes all password reset tokens for a given email", async () => {
      vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 2 });
      await deleteAllPasswordResetTokens("  User@Example.COM ");
      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
      });
    });
  });

  describe("Email Verification Tokens", () => {
    it("creates an email verification token with normalized email", async () => {
      vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.emailVerificationToken.create).mockResolvedValue({
        id: "token-v1",
        email: "newuser@example.com",
        token: "hex456",
        expires: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      });

      const token = await createEmailVerificationToken(" NewUser@Example.COM ");
      expect(token).toBeDefined();
      expect(prisma.emailVerificationToken.create).toHaveBeenCalledWith({
        data: {
          email: "newuser@example.com",
          token: expect.any(String),
          expires: expect.any(Date),
        },
      });
    });

    it("validates an unexpired email verification token", async () => {
      vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue({
        id: "token-v1",
        email: "NewUser@Example.com",
        token: "valid-v-token",
        expires: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      });

      const email = await validateEmailVerificationToken("valid-v-token");
      expect(email).toBe("newuser@example.com");
    });

    it("deletes all verification tokens for a given email", async () => {
      vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 1 });
      await deleteAllEmailVerificationTokens(" NewUser@Example.COM ");
      expect(prisma.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
        where: { email: "newuser@example.com" },
      });
    });
  });
});
