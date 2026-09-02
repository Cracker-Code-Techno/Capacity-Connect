import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> | { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.trainerId !== user.id) {
      return new NextResponse("Unauthorized to modify this course", { status: 403 });
    }

    const body = await req.json();
    const { moduleIds } = body;

    if (!Array.isArray(moduleIds)) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Update orders in a transaction
    await prisma.$transaction(
      moduleIds.map((id, index) =>
        prisma.courseModule.updateMany({
          where: { id, courseId },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MODULES_REORDER_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
