import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { trainerSubjectSchema } from "@/lib/validators/subjects";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role !== "ADMIN" && user.role !== "TRAINER") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const where = user.role === "TRAINER" ? { trainerId: user.id } : undefined;
    const items = await prisma.trainerSubject.findMany({
      where,
      include: { subject: true },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[TRAINER_SUBJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const parsed = trainerSubjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const item = await prisma.trainerSubject.upsert({
      where: { trainerId_subjectId: { trainerId: parsed.data.trainerId, subjectId: parsed.data.subjectId } },
      create: parsed.data,
      update: { rating: parsed.data.rating },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[TRAINER_SUBJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = new URL(req.url);
    const trainerId = url.searchParams.get("trainerId");
    const subjectId = url.searchParams.get("subjectId");
    if (!trainerId || !subjectId) {
      return new NextResponse("trainerId + subjectId required", { status: 400 });
    }
    await prisma.trainerSubject.delete({
      where: { trainerId_subjectId: { trainerId, subjectId } },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TRAINER_SUBJECTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}