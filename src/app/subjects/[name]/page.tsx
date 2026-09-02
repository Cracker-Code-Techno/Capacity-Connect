import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `Subject: ${decodeURIComponent(name)}`,
    description: `Courses and trainers for ${decodeURIComponent(name)}.`,
  };
}

export default async function SubjectDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const subject = await prisma.subject.findUnique({
    where: { name: decoded },
    include: {
      courses: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              feedbackAvg: true,
              feedbackCount: true,
              _count: { select: { enrollments: true, modules: true } },
              trainer: { select: { id: true, name: true } },
            },
          },
        },
      },
      trainers: {
        orderBy: { rating: "desc" },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              trainerProfile: { select: { headline: true, bio: true, yearsExperience: true } },
            },
          },
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-6xl relative z-10">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> All Subjects
        </Link>

        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest font-mono mb-1 text-[#a855f7]">SUBJECT</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            {subject.name}
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            {subject.courses.length} courses · {subject.trainers.length} matched trainers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <BookOpen className="w-5 h-5 text-[#a855f7]" /> Courses
            </h2>
            {subject.courses.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center">
                <p style={{ color: "var(--text-secondary)" }}>No courses tagged with this subject yet.</p>
              </div>
            ) : (
              subject.courses.map((cs) => (
                <Link
                  key={cs.course.id}
                  href={`/courses/${cs.course.id}`}
                  className="glass-panel p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[#a855f7]/30 block transition-colors"
                >
                  <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    {cs.course.title}
                  </h3>
                  <p className="text-sm line-clamp-2 mb-2" style={{ color: "var(--text-secondary)" }}>
                    {cs.course.description}
                  </p>
                  <div className="flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{cs.course._count.modules} modules</span>
                    <span>•</span>
                    <span>{cs.course._count.enrollments} enrolled</span>
                    {cs.course.feedbackAvg != null && (
                      <>
                        <span>•</span>
                        <span>★ {cs.course.feedbackAvg.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--text-primary)" }}>
              <GraduationCap className="w-5 h-5 text-emerald-500" /> Matched Trainers
            </h2>
            {subject.trainers.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl text-center">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No trainers yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subject.trainers.map((ts) => (
                  <Link
                    key={ts.trainerId}
                    href={`/trainer/${ts.trainerId}`}
                    className="glass-panel p-4 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-emerald-500/30 block transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{ts.trainer.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ★ {ts.rating}
                      </span>
                    </div>
                    {ts.trainer.trainerProfile?.headline && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {ts.trainer.trainerProfile.headline}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}