"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle, Lock, HelpCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/global/useToast";
import { SubjectChips } from "@/components/subjects/SubjectChips";

export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> | { courseId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState<string>("");
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [moduleProgressMap, setModuleProgressMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.courseId);
    };
    resolveParams();
  }, [params]);

  const fetchCourseDetails = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        // Fallback for missing direct route
        const allRes = await fetch('/api/courses');
        const allCourses = await allRes.json();
        const found = allCourses.find((c: any) => c.id === courseId);
        
        // Since the public endpoint might not return modules and assessments, 
        // we'll fetch them from a new dedicated endpoint or just mock for now if it's missing.
        // Wait, we need a dedicated endpoint to fetch full course details!
        // We'll create GET /api/courses/[courseId] in a moment.
      } else {
        const data = await res.json();
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);
        setUserProgress(data.userProgress || null);
        if (data.course.modules && data.course.modules.length > 0) {
          setActiveModuleId(data.course.modules[0].id);
        }
        // Fetch module progress (only if enrolled)
        if (data.isEnrolled) {
          const mpRes = await fetch(`/api/enroll/progress?courseId=${courseId}`);
          if (mpRes.ok) {
            const mp = await mpRes.json();
            const map: Record<string, boolean> = {};
            for (const m of mp.modules || []) map[m.moduleId] = m.completed;
            setModuleProgressMap(map);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        showToast("Successfully enrolled!");
        fetchCourseDetails();
      } else {
        showToast("Failed to enroll.", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleModuleComplete = async (moduleId: string, completed: boolean) => {
    try {
      const res = await fetch("/api/enroll/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, completed }),
      });
      if (res.ok) {
        const data = await res.json();
        setModuleProgressMap((prev) => ({ ...prev, [moduleId]: completed }));
        setUserProgress({
          progress: data.progress,
          status: data.status,
          completedModules: data.completedModules,
        });
        showToast(completed ? "Module marked complete" : "Marked incomplete");
      } else {
        const msg = await res.text();
        showToast(msg || "Failed to update progress", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 text-center">Loading course...</div>;
  }

  if (!course) {
    return <div className="min-h-screen pt-24 text-center text-red-500">Course not found</div>;
  }

  const activeModule = course.modules?.find((m: any) => m.id === activeModuleId);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        {!isEnrolled ? (
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-[rgba(255,255,255,0.05)] text-center max-w-3xl mx-auto mt-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-[#a855f7]" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
              <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
              {course.subjects && course.subjects.length > 0 && (
                <div className="mb-6">
                  <SubjectChips subjects={course.subjects} size="md" />
                </div>
              )}
              <button
                onClick={handleEnroll}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold tracking-widest text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
              >
                ENROLL NOW TO UNLOCK
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar: Modules & Assessments */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                <h2 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Course Content</h2>
                {course.subjects && course.subjects.length > 0 && (
                  <div className="mb-4">
                    <SubjectChips subjects={course.subjects} />
                  </div>
                )}
                {userProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      <span>PROGRESS</span>
                      <span>{userProgress.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                        style={{ width: `${userProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {course.modules?.map((mod: any, index: number) => {
                    const done = moduleProgressMap[mod.id];
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveModuleId(mod.id)}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeModuleId === mod.id ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'}`}
                        style={{ color: activeModuleId === mod.id ? "#a855f7" : "var(--text-secondary)" }}
                      >
                        {done ? (
                          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <PlayCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span className="text-sm font-semibold truncate">{index + 1}. {mod.title}</span>
                      </button>
                    );
                  })}
                </div>

                {course.assessments && course.assessments.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-bold text-lg mb-4 text-emerald-500">Assessments</h2>
                    <div className="space-y-2">
                      {course.assessments.map((assessment: any) => (
                        <Link
                          key={assessment.id}
                          href={`/courses/${courseId}/assessments/${assessment.id}`}
                          className="w-full p-3 rounded-lg flex flex-col gap-1 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 text-emerald-400">
                              <HelpCircle className="w-4 h-4 shrink-0" />
                              <span className="text-sm font-semibold truncate">{assessment.title}</span>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {assessment.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 ml-7">
                              <Calendar className="w-3 h-3" />
                              DUE {new Date(assessment.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="glass-panel p-8 md:p-12 rounded-2xl border border-[rgba(255,255,255,0.05)] min-h-[600px]">
                {activeModule ? (
                  <>
                    <div className="flex items-start justify-between gap-4 mb-8 pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
                      <h1 className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{activeModule.title}</h1>
                      <button
                        onClick={() => toggleModuleComplete(activeModule.id, !moduleProgressMap[activeModule.id])}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${
                          moduleProgressMap[activeModule.id]
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {moduleProgressMap[activeModule.id] ? (
                          <><CheckCircle className="w-4 h-4" /> COMPLETED</>
                        ) : (
                          "MARK COMPLETE"
                        )}
                      </button>
                    </div>
                    <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                      {activeModule.content.split('\n').map((paragraph: string, i: number) => (
                        <p key={i} className="leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: "var(--text-muted)" }}>
                    <BookOpen className="w-12 h-12 mb-4 opacity-40 text-[#a855f7]" />
                    <p>Select a module to start learning.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
