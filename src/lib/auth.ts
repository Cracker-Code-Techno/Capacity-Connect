import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { prisma } from "./prisma";
import { rateLimit, getClientIpFromHeaders } from "./rate-limit";
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

        const ip = req?.headers ? getClientIpFromHeaders(req.headers as unknown as Headers) : "127.0.0.1";
        const rl = rateLimit(`login:${ip}:${credentials.email.toLowerCase()}`, { limit: 5, windowMs: 15 * 60 * 1000 });
        if (!rl.success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

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

/**
 * Shared helper — fetches the current session and resolves it to the DB user
 * in a single call. Returns null if unauthenticated or user not found.
 * Use this in API routes instead of repeating getServerSession + findUnique.
 */
export async function getUserFromSession(session?: Session | null) {
  const s = session ?? (await getServerSession(authOptions));
  if (!s?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: s.user.email } });
}
