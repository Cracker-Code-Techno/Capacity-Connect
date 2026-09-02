import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmailVerificationToken, deleteEmailVerificationToken } from "@/lib/tokens";

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

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await deleteEmailVerificationToken(token);

    return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
