import { put, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { MAX_UPLOAD_BYTES, ALLOWED_MIME_PREFIXES } from "./validators/resources";

export interface BlobUploadResult {
  url: string;
  size: number;
}

function isLocalFallback(): boolean {
  return process.env.NODE_ENV === "development" && !process.env.BLOB_READ_WRITE_TOKEN;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

async function localUpload(file: File, prefix: string): Promise<BlobUploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit`);
  }
  const allowed = ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p));
  if (!allowed) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  const dir = path.join(process.cwd(), "public", "uploads", prefix);
  await fs.mkdir(dir, { recursive: true });
  const ext = path.extname(file.name) || "";
  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${sanitizeName(ext)}`;
  const fullPath = path.join(dir, safeName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buf);
  return { url: `/uploads/${prefix}/${safeName}`, size: file.size };
}

export async function uploadBlob(file: File, prefix: string): Promise<BlobUploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit`);
  }
  if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  if (isLocalFallback()) {
    return localUpload(file, prefix);
  }

  const blob = await put(`${prefix}/${Date.now()}-${sanitizeName(file.name)}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url, size: file.size };
}

export async function deleteBlob(url: string): Promise<void> {
  if (isLocalFallback() && url.startsWith("/uploads/")) {
    const fullPath = path.join(process.cwd(), "public", url);
    try {
      await fs.unlink(fullPath);
    } catch {
      // ignore — file may not exist
    }
    return;
  }
  if (url.includes("blob.vercel-storage.com")) {
    try {
      await del(url);
    } catch (err) {
      console.error("[BLOB_DELETE]", err);
    }
  }
}