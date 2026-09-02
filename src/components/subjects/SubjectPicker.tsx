"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/global/useToast";

interface Subject {
  id: string;
  name: string;
}

interface SubjectPickerProps {
  courseId: string;
  initial: Subject[];
  canEdit: boolean;
}

export function SubjectPicker({ courseId, initial, canEdit }: SubjectPickerProps) {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>(initial);
  const [all, setAll] = useState<Subject[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!canEdit) return;
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => setAll(data))
      .catch(console.error);
  }, [canEdit]);

  const addSubject = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: selectedId }),
      });
      if (res.ok) {
        const found = all.find((s) => s.id === selectedId);
        if (found && !subjects.find((s) => s.id === found.id)) {
          setSubjects([...subjects, found]);
        }
        showToast("Subject added");
      } else {
        showToast("Failed to add subject", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const removeSubject = async (subjectId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/subjects?subjectId=${subjectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubjects(subjects.filter((s) => s.id !== subjectId));
        showToast("Subject removed");
      } else {
        showToast("Failed to remove subject", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {subjects.length === 0 && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            No subjects tagged yet.
          </span>
        )}
        {subjects.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-sm text-[#a855f7] font-semibold"
          >
            {s.name}
            {canEdit && (
              <button onClick={() => removeSubject(s.id)} className="hover:text-rose-400" aria-label="Remove subject">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        ))}
      </div>
      {canEdit && (
        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-grow px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select a subject…</option>
            {all
              .filter((s) => !subjects.find((cs) => cs.id === s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
          <button
            onClick={addSubject}
            disabled={!selectedId}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>
      )}
    </div>
  );
}