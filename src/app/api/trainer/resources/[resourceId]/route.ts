import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { deleteBlob } from "@/lib/blob";

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ resourceId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const item = await prisma.trainerResource.findUnique({ where: { id: params.resourceId } });
    if (!item) return new NextResponse("Not found", { status: 404 });

    if (user.role !== "ADMIN" && item.trainerId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await deleteBlob(item.fileUrl);
    await prisma.trainerResource.delete({ where: { id: params.resourceId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TRAINER_RESOURCE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}