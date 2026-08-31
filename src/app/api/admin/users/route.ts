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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const courses = await prisma.course.findMany({
      select: { trainerId: true }
    });

    const enrollments = await prisma.enrollment.findMany({
      select: { userId: true }
    });

    const usersWithCounts = users.map(user => {
      const createdCourses = courses.filter((c: any) => c.trainerId === user.id).length;
      const userEnrollments = enrollments.filter((e: any) => e.userId === user.id).length;
      return {
        ...user,
        _count: {
          enrollments: userEnrollments,
          createdCourses
        }
      };
    });

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure we aren't demoting the last admin or something similar if needed
    // But for this prototype, we'll just allow any role change

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[ADMIN_USERS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
