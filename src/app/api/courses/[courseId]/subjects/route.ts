import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { courseTagSchema } from "@/lib/validators/subjects";

export async function POST(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const course = await prisma.course.findUnique({ where: { id: params.courseId } });
    if (!course) return new NextResponse("Course not found", { status: 404 });

    if (user.role !== "ADMIN" && course.trainerId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const parsed = courseTagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({ where: { id: parsed.data.subjectId } });
    if (!subject) return new NextResponse("Subject not found", { status: 404 });

    const link = await prisma.courseSubject.upsert({
      where: {
        courseId_subjectId: { courseId: params.courseId, subjectId: parsed.data.subjectId },
      },
      create: { courseId: params.courseId, subjectId: parsed.data.subjectId },
      update: {},
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("[COURSE_SUBJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const course = await prisma.course.findUnique({ where: { id: params.courseId } });
    if (!course) return new NextResponse("Course not found", { status: 404 });

    if (user.role !== "ADMIN" && course.trainerId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const url = new URL(req.url);
    const subjectId = url.searchParams.get("subjectId");
    if (!subjectId) return new NextResponse("subjectId required", { status: 400 });

    await prisma.courseSubject.delete({
      where: { courseId_subjectId: { courseId: params.courseId, subjectId } },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COURSE_SUBJECTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}