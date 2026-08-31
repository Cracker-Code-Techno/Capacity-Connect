"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ModuleCard({ mod, index, onRefresh }: { mod: any, index: number, onRefresh: () => void }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(mod.title);
  const [editContent, setEditContent] = useState(mod.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/trainer/modules/${mod.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onRefresh();
      } else {
        alert("Failed to delete module.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting module.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
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
        alert("Failed to update module.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating module.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-[rgba(255,255,255,0.05)] relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 flex items-center justify-center font-mono text-sm font-bold text-[#a855f7]">
            {mod.order || (index + 1)}
          </div>
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{mod.title}</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowConfirm(true)}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="pl-12 text-sm opacity-80" style={{ color: "var(--text-secondary)" }}>
        {mod.content?.substring(0, 150)}{mod.content?.length > 150 ? '...' : ''}
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 z-20">
          <div className="text-center">
            <p className="text-sm font-bold text-white mb-4">Delete this module?</p>
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

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-[#a855f7]/20 my-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">Edit Module</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">MODULE TITLE</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">CONTENT</label>
                <textarea
                  required
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a855f7] resize-y min-h-[150px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-black/20 p-2 -mx-2 rounded-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 text-sm font-bold bg-white/5 hover:bg-white/10 rounded-lg text-white"
                  disabled={isSaving}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-sm font-bold bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                >
                  {isSaving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
