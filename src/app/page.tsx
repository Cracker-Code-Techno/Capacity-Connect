"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Users, ChevronRight, Activity, Database, Server } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [highlightItems, setHighlightItems] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, courseRes, achRes, hlRes] = await Promise.all([
          fetch("/api/announcements"),
          fetch("/api/courses"),
          fetch("/api/achievements"),
          fetch("/api/homepage-highlights"),
        ]);
        if (annRes.ok) {
          const data = await annRes.json();
          setAnnouncements(data.slice(0, 3));
        }
        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourses(data.slice(0, 3));
        }
        if (achRes.ok) setAchievements(await achRes.json());
        if (hlRes.ok) {
          const hs = await hlRes.json();
          setHighlights(hs);
          // Resolve refs
          const items: Record<string, any> = {};
          for (const h of hs) {
            try {
              if (h.kind === "course") {
                const r = await fetch(`/api/courses/${h.refId}`);
                if (r.ok) items[h.refId] = await r.json();
              } else if (h.kind === "announcement") {
                const r = await fetch("/api/announcements");
                if (r.ok) {
                  const all = await r.json();
                  items[h.refId] = all.find((a: any) => a.id === h.refId);
                }
              } else if (h.kind === "achievement") {
                const all = await achRes.clone().json();
                items[h.refId] = all.find((a: any) => a.id === h.refId);
              }
            } catch {
              // ignore
            }
          }
          setHighlightItems(items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const allModules = courses.flatMap((c: any) => c.modules || []).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Ambient background glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 text-[#a855f7] text-xs font-bold tracking-widest mb-8 border border-[#a855f7]/20 shadow-[0_0_15px_rgba(168, 85, 247,0.1)]"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SYSTEM ONLINE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Capacity{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-[#e8ecf4] dark:to-[#556580] from-[#7c3aed] to-[#a855f7]">
              Connect
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 max-w-2xl mx-auto text-lg mb-12 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            A high-performance Digital Capacity Building and Learning Management
            Portal designed to support organizational training and competency
            development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            {!session ? (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 shadow-[0_0_20px_rgba(168, 85, 247,0.3)] dark:shadow-[0_0_20px_rgba(168, 85, 247,0.15)] transition-all group"
              >
                INITIALIZE{" "}
                <ChevronRight className="pointer-events-none ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href={(session.user as any)?.role === "ADMIN" ? "/admin" : (session.user as any)?.role === "TRAINER" ? "/trainer" : "/trainee"}
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 shadow-[0_0_20px_rgba(168, 85, 247,0.3)] dark:shadow-[0_0_20px_rgba(168, 85, 247,0.15)] transition-all group"
              >
                DASHBOARD{" "}
                <ChevronRight className="pointer-events-none ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest rounded-lg border transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)", borderColor: "var(--border-lit)" }}
            >
              VIEW CATALOG
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Glassmorphism Feeds Grid ──────────────────────────────────── */}
      <section
        className="py-20 relative z-10 border-t"
        style={{ borderColor: "var(--border-light)", background: "var(--panel)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Announcements Panel */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8ecf4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <Database className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-primary)" }}>
                  Announcements
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Syncing network...</p>
                ) : announcements.length > 0 ? (
                  announcements.map((ann: any) => (
                    <div key={ann.id} className="flex gap-4 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                      <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#a855f7] shrink-0 shadow-[0_0_8px_rgba(168, 85, 247,0.8)]" />
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {ann.title}
                        </h4>
                        <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>No broadcasts active.</p>
                )}
              </div>
            </motion.div>

            {/* Node Status Panel */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8ecf4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <Server className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-primary)" }}>
                  Node Status
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Verifying nodes...</p>
                ) : allModules.length > 0 ? (
                  allModules.map((mod: any, i: number) => (
                    <div key={mod.id || i} className="flex gap-4 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                      <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#10b981] shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {mod.title || `Module ${i + 1}`}
                        </h4>
                        <p className="text-xs mt-1 font-mono text-[#10b981]">
                          ONLINE
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Nodes offline.</p>
                )}
              </div>
            </motion.div>

            {/* Data Stream Panel */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8ecf4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <BookOpen className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "var(--text-primary)" }}>
                  Data Stream
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Connecting stream...</p>
                ) : courses.length > 0 ? (
                  courses.map((course: any) => (
                    <div key={course.id} className="flex gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]">
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
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>No data available.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
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
                    const ref = highlightItems[h.refId];
                    if (!ref) return null;
                    if (h.kind === "course") {
                      return (
                        <Link key={h.id} href={`/courses/${h.refId}`} className="glass-card p-5 rounded-2xl border border-[#a855f7]/20 hover:border-[#a855f7]/50 block transition-colors">
                          <p className="text-[10px] tracking-widest font-mono text-[#a855f7] mb-2">COURSE</p>
                          <h3 className="font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{ref.course?.title || ref.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>{ref.course?.description || ref.description}</p>
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div variants={itemVariants} className="flex flex-col items-center glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border" style={{ background: "var(--card)", borderColor: "var(--border-light)" }}>
                <Users className="w-6 h-6" style={{ color: "var(--text-primary)" }} />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-wide">Community</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                A thriving network of learners and experts collaborating seamlessly in a unified environment.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center glass-card p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7]/5 to-transparent pointer-events-none" />
              <div className="w-14 h-14 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168, 85, 247,0.15)] relative z-10">
                <GraduationCap className="w-6 h-6 text-[#a855f7]" />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-wide relative z-10">Competency</h3>
              <p className="text-sm leading-relaxed relative z-10" style={{ color: "var(--text-secondary)" }}>
                Smart mapping algorithms to identify suitable trainers and optimize learning pathways.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center glass-card p-8 rounded-2xl">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border" style={{ background: "var(--card)", borderColor: "var(--border-light)" }}>
                <BookOpen className="w-6 h-6" style={{ color: "var(--text-primary)" }} />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-wide">Library</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Centralized access to lectures, study materials, and assessments with real-time tracking.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
