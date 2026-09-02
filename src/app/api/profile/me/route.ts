import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { traineeProfileSchema, trainerProfileSchema } from "@/lib/validators/profile";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.role === "TRAINER") {
      const profile = await prisma.trainerProfile.findUnique({
        where: { userId: user.id },
      });
      return NextResponse.json({ role: user.role, profile });
    }

    const profile = await prisma.traineeProfile.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json({ role: user.role, profile });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    if (user.role === "TRAINER") {
      const parsed = trainerProfileSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const data = parsed.data;
      const profile = await prisma.trainerProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          bio: data.bio || null,
          headline: data.headline || null,
          yearsExperience: data.yearsExperience ?? null,
          hourlyRate: data.hourlyRate ?? null,
          socialLinks: data.socialLinks ?? undefined,
        },
        update: {
          bio: data.bio || null,
          headline: data.headline || null,
          yearsExperience: data.yearsExperience ?? null,
          hourlyRate: data.hourlyRate ?? null,
          socialLinks: data.socialLinks ?? undefined,
        },
      });
      return NextResponse.json({ role: user.role, profile });
    }

    const parsed = traineeProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const profile = await prisma.traineeProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bio: data.bio || null,
        headline: data.headline || null,
        interests: data.interests ?? [],
        skills: data.skills ?? [],
        qualifications: data.qualifications ?? undefined,
        experience: data.experience ?? undefined,
        certificates: data.certificates ?? undefined,
      },
      update: {
        bio: data.bio || null,
        headline: data.headline || null,
        interests: data.interests ?? [],
        skills: data.skills ?? [],
        qualifications: data.qualifications ?? undefined,
        experience: data.experience ?? undefined,
        certificates: data.certificates ?? undefined,
      },
    });
    return NextResponse.json({ role: user.role, profile });
  } catch (error) {
    console.error("[PROFILE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}