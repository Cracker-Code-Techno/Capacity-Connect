import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { achievementSchema } from "@/lib/validators/learning";

export async function PUT(
  req: Request,
  props: { params: Promise<{ achievementId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const parsed = achievementSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const item = await prisma.achievement.update({
      where: { id: params.achievementId },
      data: parsed.data,
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[ACHIEVEMENTS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ achievementId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    await prisma.achievement.delete({ where: { id: params.achievementId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ACHIEVEMENTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}