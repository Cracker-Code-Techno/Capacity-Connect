import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_PAGE_SIZE = 20;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
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
        // Use _count instead of full modules include on the catalog endpoint –
        // the module list is only needed on the individual course detail page.
        select: {
          id: true,
          title: true,
          description: true,
          trainerId: true,
          createdAt: true,
          updatedAt: true,
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

    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    };

    if (searchParams.has("page") || searchParams.has("limit")) {
      return NextResponse.json(
        {
          data: courses,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers }
      );
    }

    return NextResponse.json(courses, { headers });
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
