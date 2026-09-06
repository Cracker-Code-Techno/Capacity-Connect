import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generate a secure random hex token.
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Password Reset ────────────────────────────────────────────────────────

/** Creates a password-reset token for the given email (expires in 1 hour). */
export async function createPasswordResetToken(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();

  // Prune expired tokens for cleanup
  await prisma.passwordResetToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email: normalizedEmail, token, expires },
  });

  return token;
}

/** Validates a reset token. Returns normalized email if valid, null otherwise. */
export async function validatePasswordResetToken(
  token: string
): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  return record.email.trim().toLowerCase();
}

/** Deletes a specific used reset token. */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}

/** Deletes all reset tokens for an email once password reset is complete. */
export async function deleteAllPasswordResetTokens(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });
}

// ─── Email Verification ────────────────────────────────────────────────────

/** Creates an email-verification token for the given email (expires in 24 hours). */
export async function createEmailVerificationToken(
  email: string
): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();

  // Prune expired tokens for cleanup
  await prisma.emailVerificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { email: normalizedEmail, token, expires },
  });

  return token;
}

/** Validates a verification token. Returns normalized email if valid, null otherwise. */
export async function validateEmailVerificationToken(
  token: string
): Promise<string | null> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  return record.email.trim().toLowerCase();
}

/** Deletes a specific used verification token. */
export async function deleteEmailVerificationToken(token: string): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({ where: { token } });
}

/** Deletes all verification tokens for an email once verified. */
export async function deleteAllEmailVerificationTokens(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await prisma.emailVerificationToken.deleteMany({ where: { email: normalizedEmail } });
}
