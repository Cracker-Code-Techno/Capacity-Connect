"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

export function HeroButtons() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "TRAINER" ? "/trainer" : "/trainee";

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-5">
      {!session ? (
        <Link
          href="/signup"
          className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] dark:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all group"
        >
          INITIALIZE{" "}
          <ChevronRight className="pointer-events-none ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <Link
          href={dashboardHref}
          className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] dark:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all group"
        >
          DASHBOARD{" "}
          <ChevronRight className="pointer-events-none ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
      <Link
        href="/courses"
        className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest rounded-lg border transition-all hover:bg-black/5 dark:hover:bg-white/5"
        style={{ color: "var(--text-primary)", borderColor: "var(--border-lit)" }}
      >
        VIEW CATALOG
      </Link>
    </div>
  );
}
