"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, FileText, LayoutList } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CourseManagementPage({ params }: { params: Promise<{ courseId: string }> | { courseId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params conditionally (to support Next.js 15+ patterns while retaining backward compat)
  const [courseId, setCourseId] = useState<string>("");
  
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleData, setModuleData] = useState({ title: "", content: "" });
  const [moduleLoading, setModuleLoading] = useState(false);

  useEffect(() => {
    // Safely unwrap params if it's a promise (Next.js 15), or use it directly
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.courseId);
    };
    resolveParams();
  }, [params]);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/courses`);
      const allCourses = await res.json();
      const found = allCourses.find((c: any) => c.id === courseId);
      
      // Need to fetch modules explicitly since the generic /api/courses might not include them
      // For now, we mock the modules list if it's missing, since we don't have a specific GET /api/courses/[id] yet.
      if (found && !found.modules) {
        found.modules = [];
      }
      setCourse(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleLoading(true);

    try {
      const res = await fetch("/api/trainer/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: moduleData.title,
          content: moduleData.content
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setModuleData({ title: "", content: "" });
      setShowModuleForm(false);
      fetchCourse(); // refresh data
    } catch (err: any) {
      alert(err.message || "Failed to add module");
    } finally {
      setModuleLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center" style={{ color: "var(--text-primary)" }}>Loading course...</div>;
  }

  if (!course) {
    return <div className="p-12 text-center text-red-500">Course not found</div>;
  }

  return (
    <div className="flex-grow flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-5xl mx-auto relative z-10">
        
        <Link href="/trainer" className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="glass-panel p-8 rounded-2xl border border-[#a855f7]/20 mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
          <p className="text-sm max-w-3xl mb-6" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
          
          <div className="flex gap-6 text-sm">
            <span className="font-mono text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded">
              {course.modules?.length || course._count?.modules || 0} MODULES
            </span>
            <span className="font-mono" style={{ color: "var(--text-muted)" }}>
              {course._count?.enrollments || 0} Trainees Enrolled
            </span>
          </div>
        </div>

        {/* Module Manager */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <LayoutList className="w-5 h-5 text-[#a855f7]" /> Course Content
          </h2>
          <button 
            onClick={() => setShowModuleForm(!showModuleForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold tracking-widest transition-all"
          >
            {showModuleForm ? "CANCEL" : <><Plus className="w-4 h-4" /> ADD MODULE</>}
          </button>
        </div>

        {showModuleForm && (
          <div className="glass-panel p-6 rounded-xl border border-[#a855f7]/30 mb-8">
            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>Module Title</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                  style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                  placeholder="e.g. Chapter 1: Introduction"
                  value={moduleData.title}
                  onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>Content (Text/Markdown)</label>
                <textarea
                  required
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y"
                  style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                  placeholder="Enter the learning content here..."
                  value={moduleData.content}
                  onChange={(e) => setModuleData({ ...moduleData, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={moduleLoading}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                  {moduleLoading ? "SAVING..." : "SAVE MODULE"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Modules */}
        <div className="space-y-4">
          {(!course.modules || course.modules.length === 0) ? (
            <div className="p-8 text-center border border-dashed rounded-xl" style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No modules have been added to this course yet.</p>
            </div>
          ) : (
            course.modules.map((mod: any, index: number) => (
              <div key={mod.id || index} className="glass-card p-5 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 flex items-center justify-center font-mono text-sm font-bold text-[#a855f7]">
                    {mod.order || (index + 1)}
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{mod.title}</h3>
                </div>
                <div className="pl-12 text-sm opacity-80" style={{ color: "var(--text-secondary)" }}>
                  {mod.content?.substring(0, 150)}{mod.content?.length > 150 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
