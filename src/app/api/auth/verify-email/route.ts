import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmailVerificationToken, deleteAllEmailVerificationTokens } from "@/lib/tokens";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token is required." }, { status: 400 });
    }

    const email = await validateEmailVerificationToken(token);

    if (!email) {
      return NextResponse.json(
        { message: "This verification link is invalid or has expired." },
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

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), email: normalizedEmail },
    });

    await deleteAllEmailVerificationTokens(normalizedEmail);
    if (user.email && user.email !== normalizedEmail) {
      await deleteAllEmailVerificationTokens(user.email);
    }

    return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
