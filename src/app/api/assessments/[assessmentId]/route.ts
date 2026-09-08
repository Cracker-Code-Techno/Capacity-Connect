import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { POST as submitAttempt } from "./attempt/route";

export async function GET(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [assessment, priorAttempts] = await Promise.all([
      prisma.assessment.findUnique({
        where: { id: params.assessmentId },
        include: {
          questions: {
            include: {
              options: {
                select: { id: true, text: true, questionId: true },
              },
            },
          },
        },
      }),
      prisma.assessmentAttempt.findMany({
        where: {
          userId: user.id,
          assessmentId: params.assessmentId,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!assessment) return new NextResponse("Assessment not found", { status: 404 });

    return NextResponse.json({
      ...assessment,
      attempts: priorAttempts,
    });
  } catch (error) {
    console.error("[ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
) {
  // Legacy POST. Delegates in-process to the /attempt handler that owns the
  // grading logic — previously this re-issued a real HTTP request to itself,
  // costing a full network round-trip (and an extra function invocation on
  // serverless) for every submission.
  return submitAttempt(req, props);
}
