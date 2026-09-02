"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="text-center py-4">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-[#a855f7] animate-spin" />
          </div>
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
            Verifying your email…
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Just a moment, please.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
            Email verified!
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            {message} Your account is now active.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            LOG IN NOW
          </Link>
        </>
      )}

      {(status === "error" || status === "no-token") && (
        <>
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
            {status === "no-token" ? "No token provided" : "Verification failed"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            {status === "no-token"
              ? "This link appears to be incomplete."
              : message}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="text-[#a855f7] hover:underline font-medium">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-[#a855f7] hover:underline font-medium">
              sign up again
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8 border border-[#a855f7]/20 shadow-[0_0_60px_rgba(168,85,247,0.08)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#a855f7]" />
            </div>
            <div>
              <p className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                Email Verification
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Capacity Connect
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#a855f7] animate-spin mx-auto" />
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
