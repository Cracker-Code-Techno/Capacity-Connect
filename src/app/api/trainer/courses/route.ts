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
    const { title, description } = body;

    if (!title || !description) {
      return new NextResponse("Title and description are required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        trainerId: user.id,
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[TRAINER_COURSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
