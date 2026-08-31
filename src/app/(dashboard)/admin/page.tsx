import { Users, Shield, BarChart2, Settings } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "0", icon: Users },
    { label: "Active Courses", value: "0", icon: BarChart2 },
    { label: "Admins", value: "1", icon: Shield },
    { label: "System", value: "OK", icon: Settings },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "var(--background)" }}>
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-[#6366f1]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: "var(--border-light)" }}>
          <p className="text-xs font-bold tracking-widest font-mono mb-1" style={{ color: "var(--text-muted)" }}>
            DASHBOARD / ADMIN
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Admin Control Panel
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage users, roles, reports, and system-wide settings.
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

        {/* Coming Soon */}
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168, 85, 247,0.1)]">
            <Shield className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Admin Module Coming Soon</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            User management, role assignment, analytics reports, and competency mapping will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
