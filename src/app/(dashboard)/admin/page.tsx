"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, Activity, Search, ShieldAlert, CheckCircle2, Plus, Trash2, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/global/useToast";

interface AdminStats {
  totalUsers: number;
  totalTrainers: number;
  totalCourses: number;
  totalEnrollments: number;
}

interface UserCount {
  createdCourses?: number;
  enrollments?: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
  _count?: UserCount;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  // Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Subjects State
  const [subjects, setSubjects] = useState<{ id: string; name: string; _count?: { courses: number; trainers: number } }[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");

  // Achievements State
  const [achievements, setAchievements] = useState<{ id: string; title: string; description: string; imageUrl?: string | null; published: boolean }[]>([]);
  const [achTitle, setAchTitle] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achImage, setAchImage] = useState("");

  // Highlights State
  const [highlights, setHighlights] = useState<{ id: string; kind: string; refId: string; published: boolean; order: number }[]>([]);
  const [hlKind, setHlKind] = useState("course");
  const [hlRefId, setHlRefId] = useState("");
  const [hlOrder, setHlOrder] = useState("0");
  const [allCourses, setAllCourses] = useState<{ id: string; title: string }[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, subjectsRes, achRes, hlRes, coursesRes, announcementsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/subjects"),
          fetch("/api/achievements"),
          fetch("/api/homepage-highlights"),
          fetch("/api/courses"),
          fetch("/api/announcements"),
        ]);
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
        if (subjectsRes.ok) setSubjects(await subjectsRes.json());
        if (achRes.ok) setAchievements(await achRes.json());
        if (hlRes.ok) setHighlights(await hlRes.json());
        if (coursesRes.ok) {
          const list = await coursesRes.json();
          setAllCourses(Array.isArray(list) ? list.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title })) : []);
        }
        if (announcementsRes.ok) {
          const list = await announcementsRes.json();
          setAllAnnouncements(Array.isArray(list) ? list.map((a: { id: string; title: string }) => ({ id: a.id, title: a.title })) : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if ((session?.user as { role?: string })?.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        // Optimistic UI update
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        showToast(`User role updated to ${newRole} successfully.`);
      } else {
        const msg = await res.text();
        showToast(msg || "Failed to update user role", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while updating role", "error");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementContent) return;

    setIsPublishing(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: announcementTitle, content: announcementContent }),
      });
      if (res.ok) {
        setAnnouncementTitle("");
        setAnnouncementContent("");
        showToast("Announcement published successfully to all users!");
      } else {
        showToast("Failed to publish announcement", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while publishing announcement", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const refreshSubjects = async () => {
    const r = await fetch("/api/subjects");
    if (r.ok) setSubjects(await r.json());
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName.trim() }),
      });
      if (res.ok) {
        setNewSubjectName("");
        await refreshSubjects();
        showToast("Subject added");
      } else {
        const msg = await res.text();
        showToast(msg || "Failed to add subject", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const refreshAchievements = async () => {
    const r = await fetch("/api/achievements");
    if (r.ok) setAchievements(await r.json());
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim() || !achDesc.trim()) return;
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: achTitle.trim(), description: achDesc.trim(), imageUrl: achImage.trim() || undefined }),
      });
      if (res.ok) {
        setAchTitle("");
        setAchDesc("");
        setAchImage("");
        await refreshAchievements();
        showToast("Achievement saved");
      } else {
        showToast("Failed to save achievement", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const handleToggleAchievement = async (id: string, published: boolean) => {
    const res = await fetch(`/api/achievements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      await refreshAchievements();
      showToast(published ? "Achievement published" : "Achievement unpublished");
    } else {
      showToast("Failed to update achievement", "error");
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    const res = await fetch(`/api/achievements/${id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAchievements();
      showToast("Achievement deleted");
    } else {
      showToast("Failed to delete achievement", "error");
    }
  };

    const refreshHighlights = async () => {
    const r = await fetch("/api/homepage-highlights");
    if (r.ok) setHighlights(await r.json());
  };

  const handleAddHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hlRefId) return;
    try {
      const res = await fetch("/api/homepage-highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: hlKind,
          refId: hlRefId,
          order: parseInt(hlOrder || "0", 10),
        }),
      });
      if (res.ok) {
        setHlRefId("");
        setHlOrder("0");
        await refreshHighlights();
        showToast("Highlight added");
      } else {
        showToast("Failed to add highlight", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    const res = await fetch(`/api/homepage-highlights/${id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshHighlights();
      showToast("Highlight removed");
    } else {
      showToast("Failed to delete highlight", "error");
    }
  };

  // Competency Match State
  const [compSubject, setCompSubject] = useState("");
  const [compResults, setCompResults] = useState<any[]>([]);
  const [compLoading, setCompLoading] = useState(false);

  const runMatch = async () => {
    if (!compSubject) return;
    setCompLoading(true);
    try {
      const res = await fetch(`/api/competency/match?subjectId=${compSubject}`);
      if (res.ok) setCompResults(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setCompLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
          <div className="space-y-2 border-b pb-6" style={{ borderColor: "var(--border-light)" }}>
            <div className="h-4 w-32 bg-[#a855f7]/20 rounded" />
            <div className="h-8 w-64 bg-white/10 dark:bg-white/10 rounded" />
            <div className="h-4 w-96 bg-white/5 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.05)] h-28 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/10 rounded" />
                  <div className="h-7 w-12 bg-white/20 rounded" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] h-96 p-6 space-y-4">
              <div className="h-5 w-40 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/5 rounded-lg" />
              <div className="h-32 w-full bg-white/5 rounded-lg" />
              <div className="h-10 w-full bg-[#a855f7]/20 rounded-lg" />
            </div>
            <div className="xl:col-span-2 glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] h-96 p-6 space-y-4">
              <div className="h-5 w-32 bg-white/10 rounded" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-12 w-full bg-white/5 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Trainers", value: stats?.totalTrainers || 0, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Enrollments", value: stats?.totalEnrollments || 0, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: "var(--border-light)" }}>
          <p className="text-xs font-bold tracking-widest font-mono mb-1 text-[#a855f7]">
            DASHBOARD / SYSTEM ADMIN
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Command Center
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Monitor platform usage and manage user access.
          </p>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card, i) => (
            <div key={i} className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <div>
                <p className="text-xs tracking-widest font-bold mb-1" style={{ color: "var(--text-muted)" }}>{card.label.toUpperCase()}</p>
                <p className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{card.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          {/* CMS: Post Announcement */}
          <div className="xl:col-span-1 glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden flex flex-col">
            <div className="p-6 border-b" style={{ borderColor: "var(--border-light)" }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                Broadcast Message
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Publish an announcement to all users.</p>
            </div>
            <form onSubmit={handlePublishAnnouncement} className="p-6 flex flex-col gap-4 flex-grow">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Title</label>
                <input 
                  type="text" 
                  required
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                  style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                  placeholder="E.g., Scheduled Maintenance"
                />
              </div>
              <div className="flex-grow flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Message</label>
                <textarea 
                  required
                  value={announcementContent}
                  onChange={e => setAnnouncementContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 flex-grow min-h-[120px] resize-none"
                  style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                  placeholder="Write your broadcast message here..."
                />
              </div>
              <button 
                type="submit"
                disabled={isPublishing}
                className="w-full py-3 mt-2 rounded-lg font-bold text-white transition-all bg-purple-600 hover:bg-purple-700 disabled:opacity-50 tracking-widest text-sm"
              >
                {isPublishing ? "Publishing..." : "Publish Broadcast"}
              </button>
            </form>
          </div>

          {/* User Management Section */}
          <div className="xl:col-span-2 glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
            
            <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: "var(--border-light)" }}>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>User Directory</h2>
            
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs font-bold tracking-wider uppercase" style={{ borderColor: "var(--border-light)", color: "var(--text-muted)", background: "rgba(0,0,0,0.2)" }}>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Role Access</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-black/10 dark:hover:bg-white/5" style={{ borderColor: "var(--border-light)" }}>
                    <td className="px-6 py-4">
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {user.role === "TRAINER" ? (
                          <span className="text-purple-500 font-semibold">{user._count?.createdCourses || 0} Courses Created</span>
                        ) : (
                          <span className="text-blue-500 font-semibold">{user._count?.enrollments || 0} Enrollments</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {user.role === "ADMIN" && <span title="Admin User"><ShieldAlert className="w-4 h-4 text-rose-500" /></span>}
                        {user.role === "TRAINER" && <span title="Approved Trainer"><CheckCircle2 className="w-4 h-4 text-purple-500" /></span>}
                        
                        <select
                          value={user.role}
                          disabled={roleUpdating === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold outline-none border transition-colors cursor-pointer"
                          style={{ 
                            background: "var(--card)", 
                            borderColor: "var(--border-light)", 
                            color: "var(--text-primary)",
                            opacity: roleUpdating === user.id ? 0.5 : 1
                          }}
                        >
                          <option value="TRAINEE">Trainee</option>
                          <option value="TRAINER">Trainer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center" style={{ color: "var(--text-secondary)" }}>
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
        </div>

        {/* CMS: Subjects */}
        <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden mb-10">
          <div className="p-6 border-b" style={{ borderColor: "var(--border-light)" }}>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Subjects</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Subjects let you tag courses and rank trainers.
            </p>
          </div>
          <form onSubmit={handleAddSubject} className="p-6 flex gap-3 border-b" style={{ borderColor: "var(--border-light)" }}>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject name…"
              className="flex-grow px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
            <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> ADD
            </button>
          </form>
          <div className="p-6 flex flex-wrap gap-2">
            {subjects.length === 0 && (
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>No subjects yet.</span>
            )}
            {subjects.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-sm text-[#a855f7] font-semibold"
              >
                {s.name}
                <span className="text-[10px] text-[#a855f7]/70">
                  {s._count?.courses ?? 0}c · {s._count?.trainers ?? 0}t
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* CMS: Achievements */}
        <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden mb-10">
          <div className="p-6 border-b" style={{ borderColor: "var(--border-light)" }}>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Trophy className="w-5 h-5 text-amber-400" /> Achievements
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Curate milestone cards shown on the homepage.
            </p>
          </div>
          <form onSubmit={handleAddAchievement} className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b" style={{ borderColor: "var(--border-light)" }}>
            <input
              type="text"
              value={achTitle}
              onChange={(e) => setAchTitle(e.target.value)}
              placeholder="Title"
              className="px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
            <input
              type="text"
              value={achDesc}
              onChange={(e) => setAchDesc(e.target.value)}
              placeholder="Short description"
              className="px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
            <input
              type="url"
              value={achImage}
              onChange={(e) => setAchImage(e.target.value)}
              placeholder="Image URL (optional)"
              className="px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
            <button type="submit" className="sm:col-span-3 px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-1 self-start">
              <Plus className="w-4 h-4" /> ADD ACHIEVEMENT
            </button>
          </form>
          <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
            {achievements.length === 0 && (
              <p className="p-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>No achievements yet.</p>
            )}
            {achievements.map((a) => (
              <div key={a.id} className="p-4 flex items-start gap-4" style={{ borderColor: "var(--border-light)" }}>
                {a.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                )}
                <div className="flex-grow">
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{a.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAchievement(a.id, !a.published)}
                    className={`px-3 py-1 rounded text-xs font-bold ${a.published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-400 border border-white/10"}`}
                  >
                    {a.published ? "PUBLISHED" : "DRAFT"}
                  </button>
                  <button onClick={() => handleDeleteAchievement(a.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CMS: Homepage Highlights */}
        <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden mb-10">
          <div className="p-6 border-b" style={{ borderColor: "var(--border-light)" }}>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Homepage Highlights</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Feature new courses, achievements, or announcements on the homepage.
            </p>
          </div>
          <form onSubmit={handleAddHighlight} className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-3 border-b" style={{ borderColor: "var(--border-light)" }}>
            <select
              value={hlKind}
              onChange={(e) => { setHlKind(e.target.value); setHlRefId(""); }}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="course">Course</option>
              <option value="announcement">Announcement</option>
              <option value="achievement">Achievement</option>
            </select>
            <select
              value={hlRefId}
              onChange={(e) => setHlRefId(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none sm:col-span-2"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="">Select item…</option>
              {hlKind === "course" && allCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              {hlKind === "announcement" && allAnnouncements.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              {hlKind === "achievement" && achievements.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <input
              type="number"
              value={hlOrder}
              onChange={(e) => setHlOrder(e.target.value)}
              placeholder="Order"
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
            <button type="submit" disabled={!hlRefId} className="sm:col-span-4 px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-1 self-start disabled:opacity-50">
              <Plus className="w-4 h-4" /> ADD HIGHLIGHT
            </button>
          </form>
          <div className="p-6 space-y-2">
            {highlights.length === 0 && (
              <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>No highlights yet.</p>
            )}
            {highlights
              .sort((a, b) => a.order - b.order)
              .map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">{h.kind.toUpperCase()}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>#{h.order}</span>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{h.refId}</span>
                    {h.published && <span className="text-xs text-emerald-400">PUBLISHED</span>}
                  </div>
                  <button onClick={() => handleDeleteHighlight(h.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Competency Match */}
        <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden mb-10">
          <div className="p-6 border-b" style={{ borderColor: "var(--border-light)" }}>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Competency Match</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Rank trainers by competency rating for any subject.
            </p>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-3 border-b" style={{ borderColor: "var(--border-light)" }}>
            <select
              value={compSubject}
              onChange={(e) => setCompSubject(e.target.value)}
              className="flex-grow px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="">Select a subject…</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button
              onClick={runMatch}
              disabled={!compSubject || compLoading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-1 disabled:opacity-50"
            >
              {compLoading ? "RANKING…" : "RANK TRAINERS"}
            </button>
          </div>
          {compResults.length > 0 && (
            <div className="p-6 space-y-2">
              {compResults.map((m, i) => (
                <div key={m.trainerId} className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                  <span className="font-mono text-sm w-6 text-center" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                  <div className="flex-grow">
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{m.trainer.name}</p>
                    {m.trainer.trainerProfile?.headline && (
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.trainer.trainerProfile.headline}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ★ {m.rating}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
