"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/global/useToast";
import { ALLOWED_MIME_PREFIXES, MAX_UPLOAD_BYTES } from "@/lib/validators/resources";

interface ResourceUploaderProps {
  prefix: string;
  onUploaded: (result: { url: string; size: number; mimeType: string; fileName: string }) => void;
}

export function ResourceUploader({ prefix, onUploaded }: ResourceUploaderProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(`File too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024}MB)`, "error");
      return;
    }
    if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
      showToast(`File type ${file.type || "unknown"} not allowed`, "error");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("prefix", prefix);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      const data = await res.json();
      onUploaded({ url: data.url, size: file.size, mimeType: file.type, fileName: file.name });
      showToast("File uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error(err);
      showToast(message, "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleSelect(f);
        }}
        accept={ALLOWED_MIME_PREFIXES.join(",")}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> UPLOADING…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" /> UPLOAD FILE
          </>
        )}
      </button>
    </div>
  );
}