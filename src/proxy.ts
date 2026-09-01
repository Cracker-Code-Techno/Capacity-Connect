import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Role-based route protection map
const ROLE_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/trainer": ["TRAINER"],
  "/trainee": ["TRAINEE"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Edge CSRF / Origin validation for mutating API routes
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(method)
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return new NextResponse(
            JSON.stringify({ message: "Cross-origin requests are forbidden" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ message: "Invalid origin header" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // 2. Find if this path requires a specific role
  const protectedPrefix = Object.keys(ROLE_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!protectedPrefix) return NextResponse.next();

  // Decode the JWT from the session cookie (edge-compatible, no DB call)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedRoles = ROLE_ROUTES[protectedPrefix];
  const userRole = token.role as string | undefined;

  // Logged in but wrong role → redirect to their own dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    const dashboardMap: Record<string, string> = {
      ADMIN: "/admin",
      TRAINER: "/trainer",
      TRAINEE: "/trainee",
    };
    const redirectTo = dashboardMap[userRole ?? ""] ?? "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on dashboard routes and API routes
  matcher: [
    "/admin/:path*",
    "/trainer/:path*",
    "/trainee/:path*",
    "/api/:path*",
  ],
};

