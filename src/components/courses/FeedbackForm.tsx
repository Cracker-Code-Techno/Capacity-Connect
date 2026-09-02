"use client";

import { useState } from "react";
import { useToast } from "@/components/global/useToast";
import { RatingStars } from "./RatingStars";

export function FeedbackForm({ courseId, onSubmitted }: { courseId: string; onSubmitted?: () => void }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      showToast("Please choose a rating", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (res.ok) {
        showToast("Thanks for your review!");
        setComment("");
        onSubmitted?.();
      } else {
        const msg = await res.text();
        showToast(msg || "Failed to submit", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>
          Your rating
        </label>
        <RatingStars value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <label className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>
          Comment (optional)
        </label>
        <textarea
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or what could be improved?"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y"
          style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || rating < 1}
        className="px-4 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
      >
        {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
      </button>
    </form>
  );
}