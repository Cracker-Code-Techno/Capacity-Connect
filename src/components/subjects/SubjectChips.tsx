"use client";

import Link from "next/link";

interface Subject {
  id: string;
  name: string;
}

export function SubjectChips({ subjects, size = "sm" }: { subjects: Subject[]; size?: "sm" | "md" }) {
  if (!subjects || subjects.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((s) => (
        <Link
          key={s.id}
          href={`/subjects/${encodeURIComponent(s.name)}`}
          className={`inline-flex items-center gap-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] font-semibold ${
            size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
          } hover:bg-[#a855f7]/20 transition-colors`}
        >
          {s.name}
        </Link>
      ))}
    </div>
  );
}