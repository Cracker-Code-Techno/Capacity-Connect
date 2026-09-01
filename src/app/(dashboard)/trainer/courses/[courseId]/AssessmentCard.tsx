"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export default function AssessmentCard({
  assessment,
  onRefresh,
}: {
  assessment: any;
  onRefresh: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");
      const res = await fetch(`/api/trainer/assessments/${assessment.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShowConfirm(false);
        onRefresh();
      } else {
        const msg = await res.text();
        setDeleteError(msg || "Failed to delete assessment.");
      }
    } catch (error) {
      console.error(error);
      setDeleteError("Network error while deleting assessment.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="glass-card p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden group"
      style={{ borderColor: "var(--border-light)" }}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3
            className="font-bold text-base sm:text-lg mb-1 leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {assessment.title}
          </h3>
          <p className="text-xs font-mono text-emerald-500 font-bold tracking-wide">
            {assessment.questions?.length || 0} Questions
          </p>
        </div>

        <button
          onClick={() => {
            setDeleteError("");
            setShowConfirm(true);
          }}
          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg transition-colors shrink-0"
          title="Delete Assessment"
          aria-label="Delete Assessment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 z-20 text-center animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <p className="text-sm font-bold text-white mb-1">
            Delete &quot;{assessment.title}&quot;?
          </p>
          <p className="text-xs text-gray-300 mb-4 max-w-xs">
            All questions and student attempts for this quiz will be deleted.
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
                  <Trash2 className="w-3.5 h-3.5" /> DELETE QUIZ
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

