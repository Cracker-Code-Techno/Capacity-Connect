import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as any).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const courseId = params.courseId;
    const { title, description } = await req.json();

    if (!title || !description) {
      return new NextResponse("Missing title or description", { status: 400 });
    }

    // Verify ownership
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) return new NextResponse("Not Found", { status: 404 });
    if (existingCourse.trainerId !== user.id) return new NextResponse("Unauthorized", { status: 401 });

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { title, description }
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as any).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const courseId = params.courseId;

    // Verify ownership
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) return new NextResponse("Not Found", { status: 404 });
    if (existingCourse.trainerId !== user.id) return new NextResponse("Unauthorized", { status: 401 });

    const deletedCourse = await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
