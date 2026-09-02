import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { feedbackSchema } from "@/lib/validators/feedback";
import { sanitizeComment } from "@/lib/sanitize";

export async function GET(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "10", 10));

    const [items, total, agg] = await Promise.all([
      prisma.courseFeedback.findMany({
        where: { courseId: params.courseId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.courseFeedback.count({ where: { courseId: params.courseId } }),
      prisma.courseFeedback.aggregate({
        where: { courseId: params.courseId },
        _avg: { rating: true },
      }),
    ]);
    return NextResponse.json({
      data: items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      average: agg._avg.rating ?? null,
    });
  } catch (error) {
    console.error("[FEEDBACK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role !== "TRAINEE") return new NextResponse("Only trainees can review", { status: 403 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
    });
    if (!enrollment) return new NextResponse("Enroll in the course before reviewing", { status: 403 });

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const comment = parsed.data.comment ? sanitizeComment(parsed.data.comment) : null;

    const feedback = await prisma.courseFeedback.upsert({
      where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
      create: { userId: user.id, courseId: params.courseId, rating: parsed.data.rating, comment },
      update: { rating: parsed.data.rating, comment },
    });

    const agg = await prisma.courseFeedback.aggregate({
      where: { courseId: params.courseId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.course.update({
      where: { id: params.courseId },
      data: { feedbackAvg: agg._avg.rating, feedbackCount: agg._count._all },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("[FEEDBACK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}