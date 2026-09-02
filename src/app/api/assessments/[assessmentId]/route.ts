import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

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

    const assessment = await prisma.assessment.findUnique({
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
    });

    if (!assessment) return new NextResponse("Assessment not found", { status: 404 });

    const priorAttempts = await prisma.assessmentAttempt.findMany({
      where: {
        userId: user.id,
        assessmentId: assessment.id,
      },
      orderBy: { createdAt: "desc" },
    });

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
  // Legacy POST. Routes to /api/assessments/[id]/attempt for grading logic.
  const params = await props.params;
  const body = await req.text();
  const url = new URL(req.url);
  url.pathname = `/api/assessments/${params.assessmentId}/attempt`;
  const fwdHeaders = new Headers(req.headers);
  fwdHeaders.delete("host");
  fwdHeaders.delete("content-length");
  const resp = await fetch(url, {
    method: "POST",
    headers: fwdHeaders,
    body,
  });
  const text = await resp.text();
  return new NextResponse(text, {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") || "application/json" },
  });
}

