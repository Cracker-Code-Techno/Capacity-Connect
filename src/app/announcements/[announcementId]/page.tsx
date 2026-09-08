import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, Calendar, User } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// Match the homepage feed: revalidate rather than hitting the DB per request.
export const revalidate = 60;

interface PageProps {
  params: Promise<{ announcementId: string }>;
}

/**
 * Cached per request so `generateMetadata` and the page component share a
 * single database round-trip instead of querying twice.
 *
 * The try/catch stays wrapped tightly around the query: `notFound()` signals by
 * throwing, so calling it in here would let the catch swallow it.
 */
const findAnnouncement = cache(async (id: string) => {
  try {
    return await prisma.announcement.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { name: true, role: true } },
      },
    });
  } catch (error) {
    console.error("[ANNOUNCEMENT_PAGE]", error);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { announcementId } = await params;
  const announcement = await findAnnouncement(announcementId);

  if (!announcement) return { title: "Notice Not Found" };

  return {
    title: announcement.title,
    description: announcement.content.slice(0, 160),
  };
}

export default async function AnnouncementPage({ params }: PageProps) {
  const { announcementId } = await params;
  const announcement = await findAnnouncement(announcementId);

  // Missing notice → render the 404 UI with a real 404 status.
  if (!announcement) notFound();

  const posted = new Date(announcement.createdAt);
  const updated = new Date(announcement.updatedAt);
  const wasEdited = updated.getTime() - posted.getTime() > 1000;

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <article className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-[#a855f7]" />
            </div>
            <span className="text-[10px] tracking-widest font-mono text-[#a855f7]">
              ANNOUNCEMENT
            </span>
          </div>

          <h1
            className="text-3xl font-extrabold mb-5 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {announcement.title}
          </h1>

          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 mb-6 text-xs"
            style={{
              borderBottom: "1px solid var(--border-light)",
              color: "var(--text-muted)",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              {announcement.author?.name || "Capacity Connect"}
              {announcement.author?.role ? ` · ${announcement.author.role}` : ""}
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={posted.toISOString()}>
                {posted.toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </span>
            {wasEdited && <span className="italic">Edited</span>}
          </div>

          {/* Content is plain text stored via sanitizeAnnouncementContent, so
              render it as paragraphs rather than raw HTML. */}
          <div className="space-y-4">
            {announcement.content
              .split("\n")
              .filter((paragraph) => paragraph.trim().length > 0)
              .map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </article>
      </div>
    </div>
  );
}
