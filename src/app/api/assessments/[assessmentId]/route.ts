import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the assessment and questions, but exclude isCorrect for the Trainee to prevent cheating
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      include: {
        questions: {
          include: {
            options: {
              select: { id: true, text: true, questionId: true } // Omit isCorrect
            }
          }
        }
      }
    });

    if (!assessment) return new NextResponse("Assessment not found", { status: 404 });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("[ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json();
    const { answers } = body; // Map of questionId -> optionId

    if (!answers || typeof answers !== 'object') {
      return new NextResponse("Invalid answers format", { status: 400 });
    }

    // Fetch full assessment with correct answers to grade it
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!assessment) return new NextResponse("Assessment not found", { status: 404 });

    let correctCount = 0;
    const totalQuestions = assessment.questions.length;

    // Grade the assessment
    assessment.questions.forEach((question) => {
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find(o => o.isCorrect);
      if (correctOption && selectedOptionId === correctOption.id) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70; // 70% passing threshold

    // Save the attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId: user.id,
        assessmentId: assessment.id,
        score: scorePercentage,
        passed: passed
      }
    });

    return NextResponse.json({
      score: scorePercentage,
      passed,
      correctCount,
      totalQuestions,
      attemptId: attempt.id
    });
  } catch (error) {
    console.error("[ASSESSMENT_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
