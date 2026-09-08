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

    // Run assessment lookup and prior attempt count concurrently
    const [assessment, priorCount] = await Promise.all([
      prisma.assessment.findUnique({
        where: { id: params.assessmentId },
        select: {
          id: true,
          dueDate: true,
          maxAttempts: true,
          passingScore: true,
          courseId: true,
          questions: {
            select: {
              id: true,
              options: {
                where: { isCorrect: true },
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.assessmentAttempt.count({
        where: { userId: user.id, assessmentId: params.assessmentId },
      }),
    ]);

    if (!assessment) return new NextResponse("Assessment not found", { status: 404 });

    // Only trainees enrolled in the parent course may submit an attempt.
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: assessment.courseId } },
      select: { id: true },
    });
    if (!enrollment) {
      return new NextResponse("You must be enrolled in this course to attempt its assessments", {
        status: 403,
      });
    }

    if (assessment.dueDate && new Date() > new Date(assessment.dueDate)) {
      return new NextResponse("Assessment deadline has passed", { status: 403 });
    }

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

    // Pre-index correct options in a Map for O(1) lookups
    const correctMap = new Map<string, string>();
    for (const q of assessment.questions) {
      if (q.options[0]?.id) {
        correctMap.set(q.id, q.options[0].id);
      }
    }

    let correctCount = 0;
    for (const [qId, correctOptionId] of correctMap.entries()) {
      if (answers[qId] === correctOptionId) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= assessment.passingScore;
    const attemptNo = priorCount + 1;

    let attempt;
    try {
      attempt = await prisma.assessmentAttempt.create({
        data: {
          userId: user.id,
          assessmentId: assessment.id,
          attemptNo,
          score,
          passed,
        },
      });
    } catch (err) {
      // Two concurrent submissions can compute the same attemptNo and collide
      // on the [userId, assessmentId, attemptNo] unique constraint.
      if ((err as { code?: string })?.code === "P2002") {
        return NextResponse.json(
          { error: "Another attempt was submitted at the same time. Please retry." },
          { status: 409 }
        );
      }
      throw err;
    }

    if (passed) {
      // Passing an assessment completes the course outright, so progress is 100
      // by definition — no module tally needed.
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { progress: 100, status: "COMPLETED" },
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
