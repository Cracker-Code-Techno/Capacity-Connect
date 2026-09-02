import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const items = await prisma.trainerResource.findMany({
      where: { trainerId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[TRAINER_RESOURCES_PUBLIC_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}