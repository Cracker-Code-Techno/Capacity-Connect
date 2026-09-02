import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = new URL(req.url);
    const subjectId = url.searchParams.get("subjectId");
    if (!subjectId) {
      return new NextResponse("subjectId required", { status: 400 });
    }

    const matches = await prisma.trainerSubject.findMany({
      where: { subjectId },
      orderBy: { rating: "desc" },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            trainerProfile: {
              select: { bio: true, headline: true, yearsExperience: true, hourlyRate: true },
            },
            _count: { select: { trainerResources: true, trainerSubjects: true } },
          },
        },
        subject: { select: { name: true } },
      },
      take: 50,
    });

    return NextResponse.json(
      matches.map((m) => ({
        trainerId: m.trainerId,
        rating: m.rating,
        subject: m.subject,
        trainer: m.trainer,
      }))
    );
  } catch (error) {
    console.error("[COMPETENCY_MATCH_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}