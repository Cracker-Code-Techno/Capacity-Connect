import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { courseResourceSchema } from "@/lib/validators/resources";
import { deleteBlob } from "@/lib/blob";

export async function GET(
  _req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { trainerId: true },
    });
    if (!course) return new NextResponse("Not found", { status: 404 });

    const hasFullAccess =
      user?.role === "ADMIN" || course.trainerId === user?.id ||
      (user
        ? !!(await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
          }))
        : false);

    const items = await prisma.courseResource.findMany({
      where: { courseId: params.courseId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    const sanitized = items.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      mimeType: r.mimeType,
      fileSize: r.fileSize,
      order: r.order,
      createdAt: r.createdAt,
      fileUrl: hasFullAccess ? r.fileUrl : null,
      gated: !hasFullAccess,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[COURSE_RESOURCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const course = await prisma.course.findUnique({ where: { id: params.courseId } });
    if (!course) return new NextResponse("Course not found", { status: 404 });
    if (user.role !== "ADMIN" && course.trainerId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const parsed = courseResourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const item = await prisma.courseResource.create({
      data: { ...parsed.data, courseId: params.courseId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[COURSE_RESOURCES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return new NextResponse("id required", { status: 400 });

    const item = await prisma.courseResource.findUnique({ where: { id } });
    if (!item || item.courseId !== params.courseId) {
      return new NextResponse("Not found", { status: 404 });
    }
    const course = await prisma.course.findUnique({ where: { id: params.courseId } });
    if (!course) return new NextResponse("Not found", { status: 404 });
    if (user.role !== "ADMIN" && course.trainerId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    await deleteBlob(item.fileUrl);
    await prisma.courseResource.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COURSE_RESOURCES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}