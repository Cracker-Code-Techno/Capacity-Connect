import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { sanitizeAnnouncementTitle, sanitizeAnnouncementContent } from "@/lib/sanitize";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content || typeof title !== "string" || typeof content !== "string") {
      return new NextResponse("Missing or invalid title or content", { status: 400 });
    }

    const cleanTitle = sanitizeAnnouncementTitle(title);
    const cleanContent = sanitizeAnnouncementContent(content);

    if (!cleanTitle || !cleanContent) {
      return new NextResponse("Title or content cannot be empty", { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: cleanTitle,
        content: cleanContent,
        authorId: user.id,
      },
      include: {
        author: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

