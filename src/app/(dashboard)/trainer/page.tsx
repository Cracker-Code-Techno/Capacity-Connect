import { BookOpen, Users, Plus, Edit } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TrainerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || (session.user as any).role !== "TRAINER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  // Fetch courses and announcements concurrently
  const [courses, announcements] = await Promise.all([
    prisma.course.findMany({
      where: { trainerId: user.id },
      include: {
        _count: {
          select: { modules: true, enrollments: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: { select: { name: true } }
      }
    })
  ]);

  const totalTrainees = courses.reduce((sum: number, course: any) => sum + course._count.enrollments, 0);

  const stats = [
    { label: "My Courses", value: courses.length.toString(), icon: BookOpen },
    { label: "Total Trainees", value: totalTrainees.toString(), icon: Users },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "var(--background)" }}>
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-10 border-b pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4" style={{ borderColor: "var(--border-light)" }}>
          <div>
            <p className="text-xs font-bold tracking-widest font-mono mb-1" style={{ color: "var(--text-muted)" }}>
              DASHBOARD / TRAINER
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Trainer Console
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage your courses, create new content, and track trainee engagement.
            </p>
          </div>
          <Link href="/trainer/courses/new" className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Plus className="w-4 h-4" /> CREATE COURSE
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-panel p-6 rounded-xl flex items-center justify-between border border-[#a855f7]/10">
              <div>
                <p className="text-xs tracking-widest font-bold mb-1" style={{ color: "var(--text-muted)" }}>{label.toUpperCase()}</p>
                <p className="text-4xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#a855f7]/10">
                <Icon className="w-8 h-8 text-[#a855f7]" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area (2/3 width) */}
          <div className="xl:col-span-2">
            {/* Courses List */}
            <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Manage Courses</h2>

            {courses.length === 0 ? (
              <div className="glass-panel rounded-2xl p-16 text-center border border-[#a855f7]/10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[#a855f7]" />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No courses created yet</h2>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Get started by creating your first course. You can add modules, study materials, and assessments later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course: any) => (
                  <div key={course.id} className="glass-card rounded-xl p-6 flex flex-col relative group border border-[#a855f7]/10 transition-all hover:border-[#a855f7]/30">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
                      <Link href={`/trainer/courses/${course.id}`} className="p-2 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                    <p className="text-sm line-clamp-2 mb-6 flex-grow" style={{ color: "var(--text-secondary)" }}>
                      {course.description}
                    </p>
                    
                    <div className="flex gap-4 border-t pt-4" style={{ borderColor: "var(--border-light)" }}>
                      <div className="text-xs">
                        <span style={{ color: "var(--text-muted)" }}>Modules: </span>
                        <span className="font-bold text-[#a855f7]">{course._count.modules}</span>
                      </div>
                      <div className="text-xs">
                        <span style={{ color: "var(--text-muted)" }}>Enrolled: </span>
                        <span className="font-bold text-[#a855f7]">{course._count.enrollments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Area (1/3 width) */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            
            {/* Announcements Feed */}
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                Platform Feed
              </h2>
              
              <div className="flex flex-col gap-4">
                {announcements.length === 0 ? (
                  <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No new announcements right now.</p>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-2 border-blue-500/50 pl-4 py-1">
                      <p className="text-xs font-bold text-blue-500 mb-1">{announcement.author.name} • {new Date(announcement.createdAt).toLocaleDateString()}</p>
                      <h4 className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{announcement.title}</h4>
                      <p className="text-xs text-white/70">{announcement.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
