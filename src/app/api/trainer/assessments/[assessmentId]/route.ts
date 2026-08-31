import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
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

    const assessmentId = params.assessmentId;

    // Verify ownership via course
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { course: true }
    });

    if (!existingAssessment) return new NextResponse("Not Found", { status: 404 });
    if (existingAssessment.course.trainerId !== user.id) return new NextResponse("Unauthorized", { status: 401 });

    const deletedAssessment = await prisma.assessment.delete({
      where: { id: assessmentId }
    });

    return NextResponse.json(deletedAssessment);
  } catch (error) {
    console.error("[ASSESSMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
