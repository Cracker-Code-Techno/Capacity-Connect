import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
        assessments: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    let isEnrolled = false;
    let hasFullAccess = false;

    if (user) {
      // Admins and the course creator always have full access
      if (user.role === "ADMIN" || course.trainerId === user.id) {
        isEnrolled = true;
        hasFullAccess = true;
      } else {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
        });
        isEnrolled = !!enrollment;
        hasFullAccess = isEnrolled;
      }
    }

    // Gate content: If not enrolled or authorized, hide the lecture content
    const sanitizedModules = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      courseId: m.courseId,
      content: hasFullAccess ? m.content : "", // Redacted for non-enrolled users
    }));

    return NextResponse.json({
      course: {
        ...course,
        modules: sanitizedModules,
      },
      isEnrolled,
    });
  } catch (error) {
    console.error("[COURSE_DETAILS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

