"use client";

import { useState } from "react";
import { Trash2, FileText, Video, FileQuestion, type LucideIcon } from "lucide-react";
import { useToast } from "@/components/global/useToast";

export interface ResourceItem {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string | Date;
}

interface ResourceListProps {
  items: ResourceItem[];
  canDelete: boolean;
  onDelete?: (id: string) => Promise<void> | void;
}

const ICONS: Record<string, LucideIcon> = {
  lecture: Video,
  presentation: FileText,
  material: FileQuestion,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceList({ items, canDelete, onDelete }: ResourceListProps) {
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
        No resources yet.
      </p>
    );
  }

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeleting(id);
    try {
      await onDelete(id);
      showToast("Resource deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      showToast(message, "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ul className="space-y-2">
      {items.map((r) => {
        const Icon = ICONS[r.type] || FileText;
        return (
          <li
            key={r.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(255,255,255,0.05)] bg-black/20"
          >
            <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[#a855f7]" />
            </div>
            <div className="flex-grow min-w-0">
              <a
                href={r.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm hover:text-[#a855f7] truncate block"
                style={{ color: "var(--text-primary)" }}
              >
                {r.title}
              </a>
              {r.description && (
                <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                  {r.description}
                </p>
              )}
              <div className="flex gap-3 text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                <span className="font-mono uppercase">{r.type}</span>
                <span>•</span>
                <span>{formatSize(r.fileSize)}</span>
                <span>•</span>
                <span>{r.mimeType}</span>
              </div>
            </div>
            {canDelete && onDelete && (
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deleting === r.id}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg disabled:opacity-50"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}