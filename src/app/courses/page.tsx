"use client";

import { useEffect, useState } from "react";
import { BookOpen, AlertCircle, Search, User, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/global/useToast";

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load courses");
        setLoading(false);
      });
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setEnrolling(courseId);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      router.push("/trainee");
    } catch (err: any) {
      showToast(err.message || "Failed to enroll", "error");
      setEnrolling(null);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-xs font-bold tracking-widest mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CATALOG</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
              Explore Courses
            </h1>
            <p className="text-base max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              Discover learning modules designed to build capacity and accelerate professional development across the organization.
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-[#a855f7]/50"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#a855f7] animate-spin" />
          </div>
        ) : error ? (
          <div className="glass-panel p-6 text-center text-red-400 border border-red-500/20 rounded-xl flex items-center justify-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-xl flex flex-col items-center">
            <BookOpen className="w-12 h-12 text-[#a855f7]/50 mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No courses found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Check back later as new content is added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="glass-card rounded-2xl overflow-hidden flex flex-col relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Thumbnail placeholder */}
                <div className="h-48 bg-[rgba(0,0,0,0.1)] border-b" style={{ borderColor: "var(--border-light)" }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#a855f7]/10 to-transparent">
                      <BookOpen className="w-12 h-12 text-[#a855f7]/30" />
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] border font-mono tracking-widest text-[#a855f7]" style={{ borderColor: "var(--border-light)" }}>
                      {course._count?.modules || 0} MODULES
                    </span>
                    <span className="flex items-center gap-1 text-[10px] tracking-widest font-mono" style={{ color: "var(--text-muted)" }}>
                      <User className="w-3 h-3" /> {course._count?.enrollments || 0}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 leading-tight" style={{ color: "var(--text-primary)" }}>
                    {course.title}
                  </h3>
                  <p className="text-sm flex-grow mb-6 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                    {course.description}
                  </p>

                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className="w-full py-2.5 rounded-lg text-sm font-bold tracking-widest transition-all"
                    style={{ 
                      background: "var(--panel)", 
                      border: "1px solid var(--border-lit)", 
                      color: "var(--text-primary)" 
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#a855f7";
                      e.currentTarget.style.borderColor = "#a855f7";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "var(--panel)";
                      e.currentTarget.style.borderColor = "var(--border-lit)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    {enrolling === course.id ? "ENROLLING..." : "ENROLL NOW"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
