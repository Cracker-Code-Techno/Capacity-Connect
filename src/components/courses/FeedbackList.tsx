"use client";

import { useEffect, useState } from "react";
import { RatingStars } from "./RatingStars";

interface Feedback {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: string; name: string | null };
}

export function FeedbackList({ courseId }: { courseId: string }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/feedback?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId, page]);

  if (loading) {
    return <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No reviews yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <div key={f.id} className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#a855f7]/20 flex items-center justify-center text-xs font-bold text-[#a855f7]">
                {f.user.name?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {f.user.name || "Anonymous"}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <RatingStars value={f.rating} readOnly size="sm" />
          </div>
          {f.comment && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {f.comment}
            </p>
          )}
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-xs font-bold ${
                page === i + 1 ? "bg-[#a855f7] text-white" : "bg-white/5 text-gray-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}