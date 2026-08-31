"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, Activity, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if ((session?.user as any)?.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

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
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Failed to update role");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoleUpdating(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center" style={{ color: "var(--text-primary)" }}>Loading Admin Console...</div>;
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
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: "var(--border-light)" }}>
          <p className="text-xs font-bold tracking-widest font-mono mb-1 text-red-500">
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

        {/* User Management Section */}
        <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
          
          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: "var(--border-light)" }}>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>User Directory</h2>
            
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
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
                        {user.role === "ADMIN" && <ShieldAlert className="w-4 h-4 text-red-500" title="Admin User" />}
                        {user.role === "TRAINER" && <CheckCircle2 className="w-4 h-4 text-purple-500" title="Approved Trainer" />}
                        
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
  );
}
