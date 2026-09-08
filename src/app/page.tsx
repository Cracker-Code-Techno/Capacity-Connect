import Link from "next/link";
import { BookOpen, GraduationCap, Users, Activity, Database, Server } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroButtons } from "./_components/HeroButtons";

// Revalidate every 60 s at the page level so the CDN caches the rendered HTML
export const revalidate = 60;

type CourseWithModules = {
  id: string;
  title: string;
  description: string;
  modules: { id: string; title: string }[];
};

type AnnouncementWithAuthor = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; role: string };
};

type AchievementItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
};

type HighlightItem = {
  id: string;
  kind: string;
  refId: string;
  order: number;
  published: boolean;
};

export default async function Home() {
  let announcements: AnnouncementWithAuthor[] = [];
  let courses: CourseWithModules[] = [];
  let achievements: AchievementItem[] = [];
  let highlights: HighlightItem[] = [];
  const highlightMap: Record<string, { title: string; description?: string; content?: string }> = {};

  try {
    // All data fetched server-side in a single Promise.all — zero client HTTP calls
    const [resAnnouncements, resCourses, resAchievements, resHighlights] = await Promise.all([
      prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { author: { select: { name: true, role: true } } },
      }),
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          modules: { take: 3, orderBy: { order: "asc" }, select: { id: true, title: true } },
        },
      }),
      prisma.achievement.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.homepageHighlight.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
    ]);

    announcements = resAnnouncements as AnnouncementWithAuthor[];
    courses = resCourses as CourseWithModules[];
    achievements = resAchievements as AchievementItem[];
    highlights = resHighlights as HighlightItem[];

    // Resolve highlight references in a single batch — no serial waterfall
    const courseRefIds = highlights.filter((h) => h.kind === "course").map((h) => h.refId);
    const announcementRefIds = highlights.filter((h) => h.kind === "announcement").map((h) => h.refId);
    const achievementRefIds = highlights.filter((h) => h.kind === "achievement").map((h) => h.refId);

    const [hlCourses, hlAnnouncements, hlAchievements] = await Promise.all([
      courseRefIds.length
        ? prisma.course.findMany({
            where: { id: { in: courseRefIds } },
            select: { id: true, title: true, description: true },
          })
        : Promise.resolve([]),
      announcementRefIds.length
        ? prisma.announcement.findMany({
            where: { id: { in: announcementRefIds } },
            select: { id: true, title: true, content: true },
          })
        : Promise.resolve([]),
      achievementRefIds.length
        ? prisma.achievement.findMany({
            where: { id: { in: achievementRefIds } },
            select: { id: true, title: true, description: true },
          })
        : Promise.resolve([]),
    ]);

    for (const c of hlCourses) highlightMap[c.id] = { title: c.title, description: c.description };
    for (const a of hlAnnouncements) highlightMap[a.id] = { title: a.title, content: a.content };
    for (const a of hlAchievements) highlightMap[a.id] = { title: a.title, description: a.description };
  } catch (error) {
    console.error("[HOMEPAGE_FETCH_ERROR]", error);
  }

  // Carry the parent course id on each module so the Node Status panel can link
  // straight to that module inside its course.
  const allModules = courses
    .flatMap((c) => (c.modules || []).map((m) => ({ ...m, courseId: c.id })))
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Ambient background glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 text-[#a855f7] text-xs font-bold tracking-widest mb-8 border border-[#a855f7]/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Activity className="w-3.5 h-3.5" />
            <span>SYSTEM ONLINE</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Capacity{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-[#e8ecf4] dark:to-[#556580] from-[#7c3aed] to-[#a855f7]">
              Connect
            </span>
          </h1>

          <p
            className="mt-4 max-w-2xl mx-auto text-lg mb-12 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            A high-performance Digital Capacity Building and Learning Management
            Portal designed to support organizational training and competency
            development.
          </p>

          {/* Only this small island is client-rendered (needs useSession) */}
          <HeroButtons />
        </div>
      </section>

      {/* ── Glassmorphism Feeds Grid ──────────────────────────────────── */}
      <section
        className="py-20 relative z-10 border-t"
        style={{ borderColor: "var(--border-light)", background: "var(--panel)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Announcements Panel */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8ecf4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <Database className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-primary)" }}>
                  Announcements
                </h3>
              </div>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <Link
                      key={ann.id}
                      href={`/announcements/${ann.id}`}
                      className="flex gap-4 p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/50"
                    >
                      <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#a855f7] shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {ann.title}
                        </h4>
                        <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>No broadcasts active.</p>
                )}
              </div>
            </div>

            {/* Node Status Panel */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8ecf4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <Server className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-primary)" }}>
                  Node Status
                </h3>
              </div>
              <div className="space-y-4">
                {allModules.length > 0 ? (
                  allModules.map((mod, i) => (
                    <Link
                      key={mod.id || i}
                      href={`/courses/${mod.courseId}?module=${mod.id}`}
                      className="flex gap-4 p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/50"
                    >
                      <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#10b981] shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {mod.title || `Module ${i + 1}`}
                        </h4>
                        <p className="text-xs mt-1 font-mono text-[#10b981]">ONLINE</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Nodes offline.</p>
                )}
              </div>
            </div>

            {/* Data Stream Panel */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8ecf4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <BookOpen className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-primary)" }}>
                  Data Stream
                </h3>
              </div>
              <div className="space-y-4">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="flex gap-3 p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/50"
                    >
                      <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 border" style={{ background: "var(--card)", borderColor: "var(--border-light)" }}>
                        <BookOpen className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {course.title}
                        </h4>
                        <p className="text-xs mt-1 font-mono truncate" style={{ color: "var(--text-muted)" }}>
                          ID: 0x{course.id.substring(course.id.length - 4).toUpperCase()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>No data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements + Highlights Section ───────────────────────────── */}
      {(achievements.length > 0 || highlights.length > 0) && (
        <section
          className="py-20 relative z-10 border-t"
          style={{ borderColor: "var(--border-light)", background: "var(--panel)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {highlights.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-extrabold tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
                  Newly Added Content
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {highlights.slice(0, 6).map((h) => {
                    const ref = highlightMap[h.refId];
                    if (!ref) return null;
                    if (h.kind === "course") {
                      return (
                        <Link key={h.id} href={`/courses/${h.refId}`} className="glass-card p-5 rounded-2xl border border-[#a855f7]/20 hover:border-[#a855f7]/50 block transition-colors">
                          <p className="text-[10px] tracking-widest font-mono text-[#a855f7] mb-2">COURSE</p>
                          <h3 className="font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{ref.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>{ref.description}</p>
                        </Link>
                      );
                    }
                    if (h.kind === "announcement") {
                      return (
                        <div key={h.id} className="glass-card p-5 rounded-2xl border border-blue-500/20">
                          <p className="text-[10px] tracking-widest font-mono text-blue-400 mb-2">ANNOUNCEMENT</p>
                          <h3 className="font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{ref.title}</h3>
                          <p className="text-xs line-clamp-3" style={{ color: "var(--text-secondary)" }}>{ref.content}</p>
                        </div>
                      );
                    }
                    if (h.kind === "achievement") {
                      return (
                        <div key={h.id} className="glass-card p-5 rounded-2xl border border-amber-500/20">
                          <p className="text-[10px] tracking-widest font-mono text-amber-400 mb-2">ACHIEVEMENT</p>
                          <h3 className="font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{ref.title}</h3>
                          <p className="text-xs line-clamp-3" style={{ color: "var(--text-secondary)" }}>{ref.description}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
                  Achievements
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.slice(0, 6).map((a) => (
                    <div key={a.id} className="glass-card p-5 rounded-2xl border border-amber-500/20 flex gap-3">
                      {a.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{a.title}</h3>
                        <p className="text-xs line-clamp-3" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Features Section ──────────────────────────────────────────── */}
      <section
        className="py-24 relative z-10 border-t"
        style={{ borderColor: "var(--border-light)", background: "var(--card)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border" style={{ background: "var(--card)", borderColor: "var(--border-light)" }}>
                <Users className="w-6 h-6" style={{ color: "var(--text-primary)" }} />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-wide">Community</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                A thriving network of learners and experts collaborating seamlessly in a unified environment.
              </p>
            </div>

            <div className="flex flex-col items-center glass-card p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7]/5 to-transparent pointer-events-none" />
              <div className="w-14 h-14 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative z-10">
                <GraduationCap className="w-6 h-6 text-[#a855f7]" />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-wide relative z-10">Competency</h3>
              <p className="text-sm leading-relaxed relative z-10" style={{ color: "var(--text-secondary)" }}>
                Smart mapping algorithms to identify suitable trainers and optimize learning pathways.
              </p>
            </div>

            <div className="flex flex-col items-center glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border" style={{ background: "var(--card)", borderColor: "var(--border-light)" }}>
                <BookOpen className="w-6 h-6" style={{ color: "var(--text-primary)" }} />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-wide">Library</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Centralized access to lectures, study materials, and assessments with real-time tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
