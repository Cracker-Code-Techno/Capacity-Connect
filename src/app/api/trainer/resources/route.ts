import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { trainerResourceSchema } from "@/lib/validators/resources";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role !== "TRAINER" && user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const where = user.role === "ADMIN" ? {} : { trainerId: user.id };
    const items = await prisma.trainerResource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[TRAINER_RESOURCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role !== "TRAINER" && user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const parsed = trainerResourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const item = await prisma.trainerResource.create({
      data: { ...parsed.data, trainerId: user.id },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[TRAINER_RESOURCES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}