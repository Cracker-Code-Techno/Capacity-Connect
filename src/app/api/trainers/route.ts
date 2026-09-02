import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESOURCE_TYPES } from "@/lib/validators/resources";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");

    const where: any = { role: "TRAINER" };
    if (subject) {
      where.trainerSubjects = { some: { subject: { name: subject } } };
    }

    const trainers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        trainerProfile: { select: { bio: true, headline: true, yearsExperience: true, hourlyRate: true } },
        trainerSubjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
        _count: { select: { trainerResources: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      trainers.map((t) => ({
        id: t.id,
        name: t.name,
        bio: t.trainerProfile?.bio,
        headline: t.trainerProfile?.headline,
        yearsExperience: t.trainerProfile?.yearsExperience,
        hourlyRate: t.trainerProfile?.hourlyRate,
        subjects: t.trainerSubjects.map((ts) => ({ id: ts.subject.id, name: ts.subject.name, rating: ts.rating })),
        resourceCount: t._count.trainerResources,
      }))
    );
  } catch (error) {
    console.error("[TRAINERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

void RESOURCE_TYPES;