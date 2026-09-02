import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { assessmentCreateSchema } from "@/lib/validators/learning";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role !== "TRAINER" && user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const parsed = assessmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { courseId, title, dueDate, maxAttempts, passingScore, questions } = parsed.data;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return new NextResponse("Course not found", { status: 404 });
    if (user.role !== "ADMIN" && course.trainerId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        courseId,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxAttempts: maxAttempts ?? 3,
        passingScore: passingScore ?? 70,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: { create: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("[TRAINER_ASSESSMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}