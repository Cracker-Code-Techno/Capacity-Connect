"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function RatingStars({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const sizeCls = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => onChange?.(n)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${sizeCls} ${n <= display ? "fill-amber-400 text-amber-400" : "text-gray-500"}`}
          />
        </button>
      ))}
    </div>
  );
}