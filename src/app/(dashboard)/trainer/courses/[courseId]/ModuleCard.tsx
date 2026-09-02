"use client";

import { useState } from "react";
import { Edit, Trash2, AlertTriangle, Check, X, Loader2, GripVertical } from "lucide-react";
import { useToast } from "@/components/global/useToast";

interface ModuleData {
  id?: string;
  title?: string;
  content?: string;
  order?: number;
}

export default function ModuleCard({
  mod,
  index,
  onRefresh,
}: {
  mod: ModuleData;
  index: number;
  onRefresh: () => void;
}) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(mod.title ?? "");
  const [editContent, setEditContent] = useState(mod.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");
      const res = await fetch(`/api/trainer/modules/${mod.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShowConfirm(false);
        onRefresh();
      } else {
        const msg = await res.text();
        setDeleteError(msg || "Failed to delete lecture.");
      }
    } catch (error) {
      console.error(error);
      setDeleteError("Network error while deleting lecture.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`/api/trainer/modules/${mod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (res.ok) {
        setIsEditing(false);
        onRefresh();
      } else {
        showToast("Failed to update lecture.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error updating lecture.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="glass-card p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden group"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center font-mono text-xs font-bold text-[#a855f7] shrink-0">
            {mod.order || index + 1}
          </div>
          <h3
            className="font-bold text-base sm:text-lg leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {mod.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg transition-colors"
            title="Edit lecture"
            aria-label="Edit lecture"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setDeleteError("");
              setShowConfirm(true);
            }}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg transition-colors"
            title="Delete lecture"
            aria-label="Delete lecture"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="text-xs sm:text-sm pl-11 line-clamp-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {mod.content}
      </div>

      {/* Delete confirmation overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 z-20 text-center animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          
          <p className="text-sm font-bold text-white mb-1">
            Delete &quot;{mod.title}&quot;?
          </p>
          <p className="text-xs text-gray-300 mb-4 max-w-xs">
            This lecture will be permanently removed from the course.
          </p>

          {deleteError && (
            <p className="text-xs text-rose-400 mb-3">{deleteError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              disabled={isDeleting}
            >
              <X className="w-3.5 h-3.5" /> CANCEL
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 rounded-lg text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> DELETING...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> DELETE LECTURE
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Edit lecture modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-[#a855f7]/30 my-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Edit Lecture
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-5">
              <div>
                <label
                  className="block text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Lecture Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Content (Markdown / Text)
                </label>
                <textarea
                  required
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y min-h-[160px]"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-xs font-bold tracking-wider rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 hover:bg-white/5 transition-colors"
                  disabled={isSaving}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold tracking-wider bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> SAVING...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> SAVE CHANGES
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

