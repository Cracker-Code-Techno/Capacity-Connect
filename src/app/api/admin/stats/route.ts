import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUserFromSession();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Collapse 4 user-count queries into a single groupBy
    const [roleCounts, totalCourses, totalEnrollments] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]);

    const byRole = Object.fromEntries(
      roleCounts.map((r) => [r.role, r._count.id])
    );

    return NextResponse.json({
      totalUsers: roleCounts.reduce((s, r) => s + r._count.id, 0),
      totalAdmins: byRole["ADMIN"] ?? 0,
      totalTrainers: byRole["TRAINER"] ?? 0,
      totalTrainees: byRole["TRAINEE"] ?? 0,
      totalCourses,
      totalEnrollments,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
