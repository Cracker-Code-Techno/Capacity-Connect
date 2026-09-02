import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const trainer = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        trainerProfile: true,
        trainerSubjects: {
          include: { subject: { select: { id: true, name: true } } },
          orderBy: { rating: "desc" },
        },
        _count: {
          select: { trainerResources: true },
        },
      },
    });
    if (!trainer || trainer.role !== "TRAINER") {
      return new NextResponse("Trainer not found", { status: 404 });
    }
    return NextResponse.json({
      ...trainer,
      subjects: trainer.trainerSubjects.map((ts) => ({
        id: ts.subject.id,
        name: ts.subject.name,
        rating: ts.rating,
      })),
    });
  } catch (error) {
    console.error("[TRAINER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}