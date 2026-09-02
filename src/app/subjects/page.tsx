import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subjects",
  description: "Browse courses and trainers by subject area.",
};

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { courses: true, trainers: true },
      },
    },
  });

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-5xl relative z-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-xs font-bold tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>BROWSE BY TOPIC</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
            Subjects
          </h1>
          <p className="text-base max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Pick a subject to discover relevant courses and matched trainers.
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center">
            <p style={{ color: "var(--text-secondary)" }}>No subjects have been created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/subjects/${encodeURIComponent(s.name)}`}
                className="glass-panel p-6 rounded-2xl border border-[#a855f7]/20 hover:border-[#a855f7]/50 transition-colors"
              >
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {s.name}
                </h2>
                <div className="flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{s._count.courses} COURSES</span>
                  <span>•</span>
                  <span>{s._count.trainers} TRAINERS</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}