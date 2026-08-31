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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const { courseId, title, questions } = await req.json();

    if (!courseId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify course belongs to trainer
    const course = await prisma.course.findUnique({
      where: { id: courseId, trainerId: user.id }
    });

    if (!course) {
      return new NextResponse("Course not found or unauthorized", { status: 404 });
    }

    // Create Assessment with nested questions and options
    const assessment = await prisma.assessment.create({
      data: {
        title,
        courseId,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("[TRAINER_ASSESSMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
