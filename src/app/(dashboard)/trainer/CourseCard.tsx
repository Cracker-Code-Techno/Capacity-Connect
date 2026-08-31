"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseCard({ course }: { course: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDescription, setEditDescription] = useState(course.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/trainer/courses/${course.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete course.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting course.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`/api/trainer/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to update course.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating course.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 flex flex-col relative group border border-[#a855f7]/10 transition-all hover:border-[#a855f7]/30">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold pr-2" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
            title="Edit Details"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowConfirm(true)}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
            title="Delete Course"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link href={`/trainer/courses/${course.id}`} className="p-2 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] rounded-lg transition-colors border border-[#a855f7]/20" title="Manage Content">
            Manage
          </Link>
        </div>
      </div>
      
      <p className="text-sm line-clamp-2 mb-6 flex-grow" style={{ color: "var(--text-secondary)" }}>
        {course.description}
      </p>
      
      <div className="flex gap-4 border-t pt-4" style={{ borderColor: "var(--border-light)" }}>
        <div className="text-xs">
          <span style={{ color: "var(--text-muted)" }}>Modules: </span>
          <span className="font-bold text-[#a855f7]">{course._count.modules}</span>
        </div>
        <div className="text-xs">
          <span style={{ color: "var(--text-muted)" }}>Enrolled: </span>
          <span className="font-bold text-[#a855f7]">{course._count.enrollments}</span>
        </div>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 z-20">
          <div className="text-center">
            <p className="text-sm font-bold text-white mb-4">Delete this course and all its content?</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg text-white"
                disabled={isDeleting}
              >
                CANCEL
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-600 rounded-lg text-white flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? "DELETING..." : "YES, DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-[#a855f7]/20 my-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">Edit Course Details</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">COURSE TITLE</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 mb-2">DESCRIPTION</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a855f7] resize-y min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-black/20 p-2 -mx-2 rounded-lg backdrop-blur-md mt-2">
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
