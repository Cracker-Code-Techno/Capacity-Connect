"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trainer/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      router.push("/trainer");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create course");
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-3xl relative z-10">
        
        <Link href="/trainer" className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 sm:p-10 rounded-2xl border border-[#a855f7]/20"
        >
          <div className="flex items-center gap-4 mb-8 pb-8 border-b" style={{ borderColor: "var(--border-light)" }}>
            <div className="p-3 bg-[#a855f7]/10 rounded-xl">
              <BookOpen className="w-8 h-8 text-[#a855f7]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Create New Course</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Design a new training module for the organization.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Course Title
              </label>
              <input
                id="title"
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                placeholder="e.g. Advanced System Security"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y"
                style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                placeholder="Describe what trainees will learn..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
              >
                {loading ? "CREATING..." : "CREATE COURSE"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
