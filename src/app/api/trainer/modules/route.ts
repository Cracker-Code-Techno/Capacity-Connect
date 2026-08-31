import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as any).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId, title, content } = body;

    if (!courseId || !title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Ensure the trainer owns this course
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.trainerId !== user.id) {
      return new NextResponse("Unauthorized to modify this course", { status: 403 });
    }

    // Determine the next order index
    const existingModules = await prisma.courseModule.count({
      where: { courseId }
    });

    const module = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        content,
        order: existingModules + 1
      }
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("[TRAINER_MODULES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
