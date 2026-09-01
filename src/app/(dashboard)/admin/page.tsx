"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, Activity, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  // Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users")
        ]);
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
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

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
        showToast("Failed to update user role", "error");
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

      </div>

      {/* Floating toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
