"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Library, Filter, X } from "lucide-react";
import { useToast } from "@/components/global/useToast";
import { ResourceUploader } from "@/components/library/ResourceUploader";
import { ResourceList, ResourceItem } from "@/components/library/ResourceList";
import { RESOURCE_TYPES } from "@/lib/validators/resources";

export default function TrainerLibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("lecture");
  const [pendingUpload, setPendingUpload] = useState<{ url: string; size: number; mimeType: string; fileName: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user && (session.user as { role?: string }).role !== "TRAINER") {
      router.push("/");
    }
  }, [status, session, router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/resources");
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  const savePending = async () => {
    if (!pendingUpload || !title.trim()) {
      showToast("Please upload a file and enter a title", "error");
      return;
    }
    try {
      const res = await fetch("/api/trainer/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          fileUrl: pendingUpload.url,
          fileSize: pendingUpload.size,
          mimeType: pendingUpload.mimeType,
        }),
      });
      if (res.ok) {
        showToast("Resource saved");
        setTitle("");
        setDescription("");
        setPendingUpload(null);
        await load();
      } else {
        showToast("Failed to save resource", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const deleteResource = async (id: string) => {
    const res = await fetch(`/api/trainer/resources/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error("Failed to delete");
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  return (
    <div
      className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-5xl relative z-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-xs font-bold tracking-widest mb-4">
            <Library className="w-3.5 h-3.5" />
            <span>TRAINER LIBRARY</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            My Resources
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload recorded lectures, presentations, and study materials. Trainees can access them from your public profile.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[#a855f7]/20 mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Upload new resource
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 1: Introduction"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>
                Description (optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y"
                style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="flex items-center gap-3">
              <ResourceUploader prefix="trainer" onUploaded={(r) => setPendingUpload(r)} />
              {pendingUpload && (
                <div className="flex items-center gap-2 text-sm flex-grow" style={{ color: "var(--text-secondary)" }}>
                  <span className="truncate">{pendingUpload.fileName}</span>
                  <button onClick={() => setPendingUpload(null)} className="text-rose-500 hover:text-rose-400" aria-label="Discard">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                onClick={savePending}
                disabled={!pendingUpload || !title.trim()}
                className="px-4 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              All resources
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-2 py-1 rounded text-xs outline-none"
                style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              >
                <option value="all">All</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : (
            <ResourceList items={filtered} canDelete onDelete={deleteResource} />
          )}
        </div>
      </div>
    </div>
  );
}