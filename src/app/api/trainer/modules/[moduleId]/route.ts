import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  props: { params: Promise<{ moduleId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as { role?: string }).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const moduleId = params.moduleId;
    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 });
    }

    // Verify ownership via course
    const existingModule = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });

    if (!existingModule) return new NextResponse("Not Found", { status: 404 });
    if (existingModule.course.trainerId !== user.id) return new NextResponse("Unauthorized", { status: 401 });

    const updatedModule = await prisma.courseModule.update({
      where: { id: moduleId },
      data: { title, content }
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("[MODULE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ moduleId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as { role?: string }).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const moduleId = params.moduleId;

    // Verify ownership via course
    const existingModule = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });

    if (!existingModule) return new NextResponse("Not Found", { status: 404 });
    if (existingModule.course.trainerId !== user.id) return new NextResponse("Unauthorized", { status: 401 });

    const deletedModule = await prisma.courseModule.delete({
      where: { id: moduleId }
    });

    return NextResponse.json(deletedModule);
  } catch (error) {
    console.error("[MODULE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
