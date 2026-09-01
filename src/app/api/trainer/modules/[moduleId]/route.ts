import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function PUT(
  req: Request,
  props: { params: Promise<{ moduleId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();

    if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const moduleId = params.moduleId;
    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 });
    }

    // Verify ownership via course
    const existingModule = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!existingModule) return new NextResponse("Not Found", { status: 404 });
    if (user.role !== "ADMIN" && existingModule.course.trainerId !== user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedModule = await prisma.courseModule.update({
      where: { id: moduleId },
      data: { title, content },
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
    const user = await getUserFromSession();

    if (!user || (user.role !== "TRAINER" && user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const moduleId = params.moduleId;

    // Verify ownership via course
    const existingModule = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!existingModule) return new NextResponse("Not Found", { status: 404 });
    if (user.role !== "ADMIN" && existingModule.course.trainerId !== user.id) {
      return new NextResponse("Unauthorized to delete this module", { status: 403 });
    }

    const deletedModule = await prisma.courseModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json(deletedModule);
  } catch (error) {
    console.error("[MODULE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

