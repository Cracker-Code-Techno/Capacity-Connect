"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="glass-panel rounded-3xl p-8 border border-[#a855f7]/20 shadow-[0_0_60px_rgba(168,85,247,0.08)]">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
                Check your inbox
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                If <strong className="text-[#a855f7]">{email}</strong> is registered, you&apos;ll
                receive a password reset link shortly. The link expires in{" "}
                <strong>1 hour</strong>.
              </p>
              <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#a855f7] hover:underline font-medium"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                    Forgot password?
                  </h1>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    We&apos;ll send you a reset link
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 transition-all"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

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
                      <Loader2 className="w-4 h-4 animate-spin" /> SENDING...
                    </span>
                  ) : (
                    "SEND RESET LINK"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
