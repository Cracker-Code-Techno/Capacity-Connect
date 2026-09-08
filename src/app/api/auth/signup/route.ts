import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { signupSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitResult = rateLimit(`signup:${ip}`, { limit: 5, windowMs: 60 * 1000 });

    if (!limitResult.success) {
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": limitResult.remaining.toString(),
          },
        }
      );
    }

    const parsed = signupSchema.safeParse(await req.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          message:
            fieldErrors.password?.[0] ??
            fieldErrors.email?.[0] ??
            fieldErrors.name?.[0] ??
            "Invalid registration details",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }
    // signupSchema already trims the name and normalizes the email to lowercase.
    const { name, email: normalizedEmail, password, role } = parsed.data;

    const existingUser =
      (await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })) ||
      (await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      }));

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role === "TRAINER" ? "PENDING_TRAINER" : "TRAINEE",
      },
    });

    // Send verification email (fire-and-forget)
    try {
      const token = await createEmailVerificationToken(normalizedEmail);
      sendVerificationEmail(normalizedEmail, token).catch((err) =>
        console.error("[SIGNUP] Verification email failed:", err)
      );
    } catch (err) {
      console.error("[SIGNUP] Token creation failed:", err);
    }

    return NextResponse.json(
      { message: "Account created! Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
