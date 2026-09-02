import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ResourceList, ResourceItem } from "@/components/library/ResourceList";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trainer = await prisma.user.findUnique({ where: { id }, select: { name: true, role: true } });
  if (!trainer || trainer.role !== "TRAINER") return { title: "Trainer not found" };
  return { title: trainer.name || "Trainer", description: `Trainer profile for ${trainer.name}.` };
}

export default async function TrainerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainer = await prisma.user.findUnique({
    where: { id },
    include: {
      trainerProfile: true,
      trainerSubjects: {
        include: { subject: true },
        orderBy: { rating: "desc" },
      },
      trainerResources: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trainer || trainer.role !== "TRAINER") {
    notFound();
  }

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-5xl relative z-10">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <div className="glass-panel p-8 rounded-2xl border border-[#a855f7]/20 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/20 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-[#a855f7]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {trainer.name}
              </h1>
              {trainer.trainerProfile?.headline && (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {trainer.trainerProfile.headline}
                </p>
              )}
            </div>
          </div>
          {trainer.trainerProfile?.bio && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {trainer.trainerProfile.bio}
            </p>
          )}
          {trainer.trainerSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trainer.trainerSubjects.map((ts) => (
                <Link
                  key={ts.subjectId}
                  href={`/subjects/${encodeURIComponent(ts.subject.name)}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-sm text-[#a855f7] font-semibold hover:bg-[#a855f7]/20"
                >
                  {ts.subject.name}
                  <span className="text-[10px] text-[#a855f7]/70">★ {ts.rating}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <BookOpen className="w-5 h-5 text-[#a855f7]" /> Library
          </h2>
          <ResourceList items={trainer.trainerResources as unknown as ResourceItem[]} canDelete={false} />
        </div>
      </div>
    </div>
  );
}