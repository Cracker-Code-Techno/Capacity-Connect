import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { achievementSchema } from "@/lib/validators/learning";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "1";
    const user = await getUserFromSession();

    const items = await prisma.achievement.findMany({
      where: !showAll && user?.role !== "ADMIN" ? { published: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
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