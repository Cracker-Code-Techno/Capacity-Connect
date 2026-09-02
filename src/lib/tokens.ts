import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generate a secure random hex token.
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Password Reset ────────────────────────────────────────────────────────

/** Creates (or replaces) a password-reset token for the given email. */
export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete any existing token for this email first
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  return token;
}

/** Validates a reset token. Returns the email if valid, null otherwise. */
export async function validatePasswordResetToken(
  token: string
): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  return record.email;
}

/** Deletes a used reset token. */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}

// ─── Email Verification ────────────────────────────────────────────────────

/** Creates (or replaces) an email-verification token for the given email. */
export async function createEmailVerificationToken(
  email: string
): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { email } });

  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { email, token, expires },
  });

  return token;
}

/** Validates a verification token. Returns email if valid, null otherwise. */
export async function validateEmailVerificationToken(
  token: string
): Promise<string | null> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  return record.email;
}

/** Deletes a used verification token. */
export async function deleteEmailVerificationToken(token: string): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({ where: { token } });
}
