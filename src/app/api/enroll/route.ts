import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Create the enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        status: "ACTIVE",
        progress: 0,
      }
    });

    return NextResponse.json(enrollment);
  } catch (error: any) {
    console.error("[ENROLL_POST]", error);
    if (error.code === 'P2002') {
      return new NextResponse("Already enrolled", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
