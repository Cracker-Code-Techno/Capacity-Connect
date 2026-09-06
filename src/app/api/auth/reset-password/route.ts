import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePasswordResetToken, deleteAllPasswordResetTokens } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ message: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

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
