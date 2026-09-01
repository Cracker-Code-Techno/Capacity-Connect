import "next-auth";
import "next-auth/jwt";

// Extend the built-in NextAuth types to include custom fields (role, id)
// so we never need `(session.user as any).role` casts anywhere in the codebase.

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
