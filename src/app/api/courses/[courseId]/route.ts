import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        assessments: true
      }
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    let isEnrolled = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id
            }
          }
        });
        isEnrolled = !!enrollment;
      }
    }

    return NextResponse.json({ course, isEnrolled });
  } catch (error) {
    console.error("[COURSE_DETAILS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
