import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const rawHeaders = req?.headers as Record<string, string | string[] | undefined> | undefined;
        const forwardedFor = rawHeaders?.["x-forwarded-for"];
        const ip = typeof forwardedFor === "string"
          ? forwardedFor.split(",")[0].trim()
          : (rawHeaders?.["x-real-ip"] as string | undefined) ?? "127.0.0.1";

        const normalizedEmail = credentials.email.trim().toLowerCase();

        const rl = rateLimit(`login:${ip}:${normalizedEmail}`, { limit: 5, windowMs: 60 * 1000 });
        if (!rl.success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user =
          (await prisma.user.findUnique({
            where: { email: normalizedEmail }
          })) ||
          (await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: "insensitive" } }
          }));

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in. Check your inbox for the verification link.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

/**
 * Returns lightweight session identity (id, email, role, name) directly from
 * the decoded JWT session without triggering any database queries.
 */
export async function getSessionUser(session?: Session | null): Promise<SessionUser | null> {
  const s = session ?? (await getServerSession(authOptions));
  if (!s?.user?.id || !s.user.email) return null;
  return {
    id: s.user.id,
    email: s.user.email,
    role: (s.user as { role?: string }).role || "TRAINEE",
    name: s.user.name,
  };
}

/**
 * Shared helper — fetches the current session and resolves it to the DB user.
 * Uses primary-key ID lookup first (O(1) B-tree index), falling back to indexed email.
 * Returns null if unauthenticated or user not found.
 */
export async function getUserFromSession(session?: Session | null) {
  const s = session ?? (await getServerSession(authOptions));
  if (!s?.user) return null;

  if (s.user.id) {
    const user = await prisma.user.findUnique({ where: { id: s.user.id } });
    if (user) return user;
  }

  if (s.user.email) {
    const normalizedEmail = s.user.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) return user;

    return prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
  }

  return null;
}
