"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div
      className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#6366f1]/5 blur-[120px] pointer-events-none" />

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
            Welcome back
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to access your learning dashboard
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
            <label htmlFor="email" className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-[#a855f7]/50"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-purple-500" />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-[#a855f7] hover:text-purple-400 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 dark:bg-[#a855f7]/20 dark:border-[#a855f7]/30 border border-purple-600 hover:bg-purple-700 dark:hover:bg-[#a855f7]/30 transition-all shadow-[0_0_20px_rgba(168, 85, 247,0.15)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          No account?{" "}
          <Link href="/signup" className="text-[#a855f7] hover:text-purple-400 font-semibold transition-colors">
            Create one here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
