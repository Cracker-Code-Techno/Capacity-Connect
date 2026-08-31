import { BookOpen, GraduationCap, Clock, Award, PlayCircle, CheckCircle } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TraineeDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const [user, announcements] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                _count: {
                  select: { modules: true }
                }
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }
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

  if (!user) redirect("/login");

  const enrollments = user.enrollments;
  const activeCount = enrollments.filter(e => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter(e => e.status === "COMPLETED").length;

  const stats = [
    { label: "Enrolled Courses", value: enrollments.length.toString(), icon: BookOpen },
    { label: "Completed", value: completedCount.toString(), icon: Award },
    { label: "Active", value: activeCount.toString(), icon: PlayCircle },
    { label: "Certificates", value: "0", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "var(--background)" }}>
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: "var(--border-light)" }}>
          <p className="text-xs font-bold tracking-widest font-mono mb-1" style={{ color: "var(--text-muted)" }}>
            DASHBOARD / TRAINEE
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Welcome, {user.name || "Trainee"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Track your progress, access courses, and manage your certifications.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-panel p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20">
                  <Icon className="w-4 h-4 text-[#a855f7]" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs mt-1 tracking-wide" style={{ color: "var(--text-muted)" }}>{label.toUpperCase()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area (2/3 width) */}
          <div className="xl:col-span-2">
            {/* Active Courses */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>My Courses</h2>
              <Link href="/courses" className="text-sm font-semibold text-[#a855f7] hover:text-purple-400">
                Browse Catalog &rarr;
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  <BookOpen className="w-8 h-8 text-[#a855f7]" />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No active enrollments</h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  You haven't enrolled in any courses yet. Browse the catalog to start learning.
                </p>
                <Link href="/courses" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  BROWSE COURSES
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-[#a855f7]" />
                        </div>
                        <div>
                          <h3 className="font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                            {enrollment.course.title}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {enrollment.course._count.modules} Modules
                          </p>
                        </div>
                      </div>
                      {enrollment.status === "COMPLETED" ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">COMPLETED</span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 rounded">ACTIVE</span>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t" style={{ borderColor: "var(--border-light)" }}>
                      <div className="flex justify-between text-xs mb-2">
                        <span style={{ color: "var(--text-secondary)" }}>Progress</span>
                        <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{enrollment.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--panel)" }}>
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Link href={`/courses/${enrollment.courseId}`} className="text-sm font-semibold text-[#a855f7] hover:text-purple-400 flex items-center gap-1">
                          Continue Learning <PlayCircle className="w-4 h-4" />
                        </Link>
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
