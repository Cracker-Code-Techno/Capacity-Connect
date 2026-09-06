import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();

    if (!user || user.role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId, title, content } = body;

    if (!courseId || !title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure the trainer owns this course
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || course.trainerId !== user.id) {
      return new NextResponse("Unauthorized to modify this course", { status: 403 });
    }

    // Determine the next order index
    const existingModules = await prisma.courseModule.count({ where: { courseId } });

    const courseModule = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        content,
        order: existingModules + 1,
      },
    });

    return NextResponse.json(courseModule);
  } catch (error) {
    console.error("[TRAINER_MODULES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
