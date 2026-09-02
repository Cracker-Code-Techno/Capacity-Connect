import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions, getUserFromSession } from "@/lib/auth";


export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: searchParams.has("page") ? skip : undefined,
        take: searchParams.has("limit") ? limit : undefined,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Fetch course counts separately
    const courseCounts = await prisma.course.groupBy({
      by: ["trainerId"],
      _count: { id: true },
    });
    const courseCountMap = Object.fromEntries(
      courseCounts.map((c) => [c.trainerId, c._count.id])
    );

    const usersWithCounts = users.map((u) => ({
      ...u,
      _count: {
        enrollments: u._count.enrollments,
        createdCourses: courseCountMap[u.id] ?? 0,
      },
    }));

    if (searchParams.has("page") || searchParams.has("limit")) {
      return NextResponse.json({
        data: usersWithCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

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

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!target) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (target.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return new NextResponse("Cannot demote the last admin user", { status: 400 });
      }
    }

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
