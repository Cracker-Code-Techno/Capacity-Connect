import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { subjectSchema } from "@/lib/validators/subjects";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { courses: true, trainers: true },
        },
      },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("[SUBJECTS_GET]", error);
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
    const parsed = subjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.subject.findUnique({ where: { name: parsed.data.name } });
    if (existing) {
      return new NextResponse("Subject already exists", { status: 409 });
    }

    const subject = await prisma.subject.create({ data: { name: parsed.data.name } });
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("[SUBJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}