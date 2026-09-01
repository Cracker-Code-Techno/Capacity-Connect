import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [
      totalUsers,
      totalAdmins,
      totalTrainers,
      totalTrainees,
      totalCourses,
      totalEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "TRAINER" } }),
      prisma.user.count({ where: { role: "TRAINEE" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalTrainers,
      totalTrainees,
      totalCourses,
      totalEnrollments,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
