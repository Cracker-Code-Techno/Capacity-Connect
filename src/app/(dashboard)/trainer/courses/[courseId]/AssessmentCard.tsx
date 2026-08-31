"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function AssessmentCard({ assessment, onRefresh }: { assessment: any, onRefresh: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/trainer/assessments/${assessment.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onRefresh();
      } else {
        alert("Failed to delete assessment.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting assessment.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>{assessment.title}</h3>
          <p className="text-xs font-mono text-emerald-500">{assessment.questions?.length || 0} Questions</p>
        </div>
        <button 
          onClick={() => setShowConfirm(true)}
          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
          title="Delete Assessment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
          <div className="text-center">
            <p className="text-sm font-bold text-white mb-4">Delete this assessment?</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg text-white"
                disabled={isDeleting}
              >
                CANCEL
              </button>
              <button 
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 rounded-lg text-white"
                disabled={isDeleting}
              >
                {isDeleting ? "DELETING..." : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
