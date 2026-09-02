"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
          Invalid link
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          This reset link is missing a token.{" "}
          <Link href="/forgot-password" className="text-[#a855f7] hover:underline font-medium">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
          Password updated!
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          You&apos;re being redirected to login…
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-[#a855f7]" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Reset password
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Choose a strong new password
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoFocus
              minLength={8}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 transition-all"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="block text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Confirm password
          </label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 transition-all"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => {
                const strength =
                  password.length >= 12
                    ? 4
                    : password.length >= 10
                    ? 3
                    : password.length >= 8
                    ? 2
                    : 1;
                const colors = ["bg-rose-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      level <= strength ? colors[strength - 1] : "bg-white/10"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {password.length < 8
                ? "Too short"
                : password.length < 10
                ? "Fair — consider a longer password"
                : password.length < 12
                ? "Good"
                : "Strong"}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-rose-400 bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm tracking-widest text-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          style={{
            background: "linear-gradient(135deg, #a855f7, #7c3aed)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> UPDATING...
            </span>
          ) : (
            "UPDATE PASSWORD"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8 border border-[#a855f7]/20 shadow-[0_0_60px_rgba(168,85,247,0.08)]">
          <Suspense fallback={<div className="text-center py-8 text-gray-400">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
