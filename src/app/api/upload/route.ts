import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { uploadBlob } from "@/lib/blob";
import { MAX_UPLOAD_BYTES, ALLOWED_MIME_PREFIXES } from "@/lib/validators/resources";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    const prefix = (form.get("prefix") as string) || "uploads";

    if (!file || !(file instanceof File)) {
      return new NextResponse("No file provided", { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return new NextResponse("File too large (max 25MB)", { status: 413 });
    }
    if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
      return new NextResponse(`File type ${file.type} not allowed`, { status: 415 });
    }

    const result = await uploadBlob(file, prefix);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Error";
    console.error("[UPLOAD_POST]", error);
    return new NextResponse(message, { status: 500 });
  }
}