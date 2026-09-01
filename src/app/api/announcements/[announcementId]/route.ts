import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

function sanitizeText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .trim();
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ announcementId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content || typeof title !== "string" || typeof content !== "string") {
      return new NextResponse("Missing or invalid title or content", { status: 400 });
    }

    const cleanTitle = sanitizeText(title).substring(0, 200);
    const cleanContent = sanitizeText(content).substring(0, 5000);

    if (!cleanTitle || !cleanContent) {
      return new NextResponse("Title or content cannot be empty", { status: 400 });
    }

    const updated = await prisma.announcement.update({
      where: { id: params.announcementId },
      data: { title: cleanTitle, content: cleanContent },
      include: {
        author: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ANNOUNCEMENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  props: { params: Promise<{ announcementId: string }> }
) {
  try {
    const params = await props.params;
    const user = await getUserFromSession();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deleted = await prisma.announcement.delete({
      where: { id: params.announcementId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("[ANNOUNCEMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
