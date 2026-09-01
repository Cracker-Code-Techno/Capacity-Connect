import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();

    if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assessmentId = params.assessmentId;

    // Verify ownership via course
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { course: true },
    });

    if (!existingAssessment) return new NextResponse("Not Found", { status: 404 });
    if (user.role !== "ADMIN" && existingAssessment.course.trainerId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedAssessment = await prisma.assessment.delete({
      where: { id: assessmentId },
    });

    return NextResponse.json(deletedAssessment);
  } catch (error) {
    console.error("[ASSESSMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

