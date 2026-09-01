import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: searchParams.has("page") ? skip : undefined,
        take: searchParams.has("limit") ? limit : undefined,
        include: {
          modules: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
          _count: {
            select: { modules: true, enrollments: true, assessments: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count({ where }),
    ]);

    if (searchParams.has("page") || searchParams.has("limit")) {
      return NextResponse.json({
        data: courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

