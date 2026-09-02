import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { attemptSchema } from "@/lib/validators/learning";

export async function POST(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = attemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { answers } = parsed.data;

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      include: {
        questions: { include: { options: true } },
        course: { select: { id: true, _count: { select: { modules: true } } } },
      },
    });
    if (!assessment) return new NextResponse("Assessment not found", { status: 404 });

    if (assessment.dueDate && new Date() > new Date(assessment.dueDate)) {
      return new NextResponse("Assessment deadline has passed", { status: 403 });
    }

    const priorCount = await prisma.assessmentAttempt.count({
      where: { userId: user.id, assessmentId: assessment.id },
    });
    if (priorCount >= assessment.maxAttempts) {
      return NextResponse.json(
        { error: `Maximum attempts (${assessment.maxAttempts}) reached` },
        { status: 403 }
      );
    }

    const totalQuestions = assessment.questions.length;
    if (totalQuestions === 0) {
      return new NextResponse("Assessment has no questions", { status: 400 });
    }
    let correctCount = 0;
    for (const q of assessment.questions) {
      const selected = answers[q.id];
      const correct = q.options.find((o) => o.isCorrect);
      if (correct && selected === correct.id) correctCount++;
    }
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= assessment.passingScore;
    const attemptNo = priorCount + 1;

    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId: user.id,
        assessmentId: assessment.id,
        attemptNo,
        score,
        passed,
      },
    });

    if (passed) {
      const totalModules = assessment.course._count.modules || 1;
      const completedModules = await prisma.moduleProgress.count({
        where: { userId: user.id, module: { courseId: assessment.courseId }, completed: true },
      });
      const moduleProgress = Math.round((completedModules / totalModules) * 100);
      const newProgress = Math.max(moduleProgress, 100);
      await prisma.enrollment.updateMany({
        where: { userId: user.id, courseId: assessment.courseId },
        data: {
          progress: newProgress,
          status: "COMPLETED",
        },
      });
    }

    return NextResponse.json({
      score,
      passed,
      correctCount,
      totalQuestions,
      attemptId: attempt.id,
      attemptNo,
      attemptsRemaining: assessment.maxAttempts - attemptNo,
    });
  } catch (error) {
    console.error("[ASSESSMENT_ATTEMPT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}