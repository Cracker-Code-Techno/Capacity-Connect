import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { achievementSchema } from "@/lib/validators/learning";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "1";
    const user = await getUserFromSession();

    const isAdmin = user?.role === "ADMIN";

    const items = await prisma.achievement.findMany({
      where: !showAll && !isAdmin ? { published: true } : undefined,
      orderBy: { createdAt: "desc" },
    });

    // Only publicly-scoped (no ?all=1) responses are safe to cache
    const headers =
      !showAll && !isAdmin
        ? { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" }
        : { "Cache-Control": "private, no-store" };

    return NextResponse.json(items, { headers });
  } catch (error) {
    console.error("[ACHIEVEMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const item = await prisma.achievement.create({ data: parsed.data });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[ACHIEVEMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
