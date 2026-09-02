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
            dueDate: true,
            maxAttempts: true,
            passingScore: true,
          },
        },
        subjects: {
          include: { subject: true },
        },
        resources: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            order: true,
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

    const sanitizedModules = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      courseId: m.courseId,
      content: hasFullAccess ? m.content : "",
    }));

    const resources = hasFullAccess
      ? course.resources
      : course.resources.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          type: r.type,
          order: r.order,
          mimeType: r.mimeType,
          fileUrl: null,
          fileSize: r.fileSize,
          gated: true,
        }));

    let userProgress: { progress: number; status: string; completedModules: number } | null = null;
    if (user && isEnrolled && user.role === "TRAINEE") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
      });
      const completedModules = await prisma.moduleProgress.count({
        where: { userId: user.id, module: { courseId: course.id }, completed: true },
      });
      userProgress = {
        progress: enrollment?.progress ?? 0,
        status: enrollment?.status ?? "ACTIVE",
        completedModules,
      };
    }

    return NextResponse.json({
      course: {
        ...course,
        modules: sanitizedModules,
        resources,
        subjects: course.subjects.map((cs) => ({ id: cs.subject.id, name: cs.subject.name })),
      },
      isEnrolled,
      userProgress,
    });
  } catch (error) {
    console.error("[COURSE_DETAILS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}