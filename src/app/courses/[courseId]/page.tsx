"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle, Lock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> | { courseId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

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
        if (data.course.modules && data.course.modules.length > 0) {
          setActiveModuleId(data.course.modules[0].id);
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
        alert("Successfully enrolled!");
        fetchCourseDetails();
      } else {
        alert("Failed to enroll.");
      }
    } catch (err) {
      console.error(err);
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
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
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
                <div className="space-y-2">
                  {course.modules?.map((mod: any, index: number) => (
                    <button
                      key={mod.id}
                      onClick={() => setActiveModuleId(mod.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeModuleId === mod.id ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'}`}
                      style={{ color: activeModuleId === mod.id ? "#a855f7" : "var(--text-secondary)" }}
                    >
                      <PlayCircle className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-semibold truncate">{index + 1}. {mod.title}</span>
                    </button>
                  ))}
                </div>

                {course.assessments && course.assessments.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-bold text-lg mb-4 text-emerald-500">Assessments</h2>
                    <div className="space-y-2">
                      {course.assessments.map((assessment: any) => (
                        <Link
                          key={assessment.id}
                          href={`/courses/${courseId}/assessments/${assessment.id}`}
                          className="w-full p-3 rounded-lg flex items-center justify-between border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3 text-emerald-400">
                            <HelpCircle className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-semibold truncate">{assessment.title}</span>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <h1 className="text-3xl font-extrabold mb-8 pb-4 border-b" style={{ color: "var(--text-primary)", borderColor: "var(--border-light)" }}>{activeModule.title}</h1>
                    <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                      {/* Very simple rendering for markdown/text */}
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
