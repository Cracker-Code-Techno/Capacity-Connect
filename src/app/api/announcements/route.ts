import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: user.id
      },
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
