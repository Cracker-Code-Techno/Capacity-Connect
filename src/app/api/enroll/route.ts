import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId || typeof courseId !== "string") {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    // Without this check a bad courseId surfaces as a foreign-key error and a
    // confusing 500 rather than a 404.
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("[ENROLL_POST]", error);
    const err = error as { code?: string };
    if (err?.code === "P2002") {
      return new NextResponse("Already enrolled", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
