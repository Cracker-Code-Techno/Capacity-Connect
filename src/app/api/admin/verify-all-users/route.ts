import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * One-time admin utility: marks all users with no emailVerified as verified.
 * Protected by a shared secret. DELETE this route after use.
 *
 * Usage: GET /api/admin/verify-all-users?secret=<ADMIN_PATCH_SECRET>
 */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_PATCH_SECRET) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const result = await prisma.user.updateMany({
    where: { emailVerified: null },
    data: { emailVerified: new Date() },
  });

  return NextResponse.json({
    message: `Verified ${result.count} user(s).`,
    count: result.count,
  });
}
