import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { moduleProgressSchema } from "@/lib/validators/learning";

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role !== "TRAINEE") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const parsed = moduleProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { moduleId, completed } = parsed.data;

    const mod = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: { select: { id: true, _count: { select: { modules: true } } } } },
    });
    if (!mod) return new NextResponse("Module not found", { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: mod.courseId } },
    });
    if (!enrollment) return new NextResponse("Not enrolled in this course", { status: 403 });

    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId } },
      create: { userId: user.id, moduleId, completed, completedAt: completed ? new Date() : null },
      update: { completed, completedAt: completed ? new Date() : null },
    });

    const totalModules = mod.course._count.modules || 1;
    const completedCount = await prisma.moduleProgress.count({
      where: { userId: user.id, module: { courseId: mod.courseId }, completed: true },
    });
    const progress = Math.min(100, Math.round((completedCount / totalModules) * 100));

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        status: progress >= 100 ? "COMPLETED" : enrollment.status,
      },
    });

    return NextResponse.json({
      progress: updated.progress,
      status: updated.status,
      completedModules: completedCount,
      totalModules,
    });
  } catch (error) {
    console.error("[ENROLL_PROGRESS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    if (!courseId) return new NextResponse("courseId required", { status: 400 });

    const items = await prisma.moduleProgress.findMany({
      where: { userId: user.id, module: { courseId } },
      select: { moduleId: true, completed: true, completedAt: true },
    });
    return NextResponse.json({ modules: items });
  } catch (error) {
    console.error("[ENROLL_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}