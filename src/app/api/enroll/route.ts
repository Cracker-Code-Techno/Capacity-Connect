import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("[ENROLL_POST]", error);
    const err = error as { code?: string };
    if (err?.code === "P2002") {
      return new NextResponse("Already enrolled", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
