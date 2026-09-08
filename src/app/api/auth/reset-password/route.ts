import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePasswordResetToken, deleteAllPasswordResetTokens } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    const parsed = resetPasswordSchema.safeParse(await req.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { message: fieldErrors.password?.[0] ?? "Token and password are required." },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    const email = await validatePasswordResetToken(token);

    if (!email) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up user by normalized email or case-insensitively
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: "User account could not be found." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and heal email casing by id
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, email: normalizedEmail },
    });

    // Invalidate all tokens for this email after successful reset
    await deleteAllPasswordResetTokens(normalizedEmail);
    if (user.email && user.email !== normalizedEmail) {
      await deleteAllPasswordResetTokens(user.email);
    }

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
