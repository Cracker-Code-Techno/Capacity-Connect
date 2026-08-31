"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TRAINEE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-[#a855f7]/50";
  const inputStyle = {
    background: "var(--card)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
  };
  const labelClass = "block text-xs font-bold tracking-widest uppercase mb-2";

  return (
    <div
      className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#6366f1]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel max-w-md w-full rounded-2xl p-10 relative z-10"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto h-12 w-12 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168, 85, 247,0.15)] mb-6">
            <BookOpen className="h-6 w-6 text-[#a855f7]" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Create an account
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Join the learning management portal
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div>
            <label htmlFor="name" className={labelClass} style={{ color: "var(--text-muted)" }}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={inputClass}
              style={inputStyle}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass} style={{ color: "var(--text-muted)" }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              style={inputStyle}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass} style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
              style={inputStyle}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass} style={{ color: "var(--text-muted)" }}>
              I am a
            </label>
            <select
              id="role"
              name="role"
              className={inputClass}
              style={inputStyle}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="TRAINEE">Trainee</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 dark:bg-[#a855f7]/20 dark:border-[#a855f7]/30 border border-purple-600 hover:bg-purple-700 dark:hover:bg-[#a855f7]/30 transition-all shadow-[0_0_20px_rgba(168, 85, 247,0.15)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="text-[#a855f7] hover:text-purple-400 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
