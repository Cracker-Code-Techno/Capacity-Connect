import { Info, Target, Users, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Capacity Connect is built by Cracker Code for the Smart India Hackathon — meet the team behind the platform.",
};

const TEAM_NAME = "Cracker Code";

interface Member {
  name: string;
  /** GitHub username, omitted for members without a public profile. */
  github?: string;
}

const team: Member[] = [
  { name: "Avranil Sarkar", github: "IdkAnythin07" },
  { name: "Ananya Dasgupta", github: "ananyadasgupta08" },
  { name: "Debatroyie Halder", github: "debatroyiehalder-design" },
  { name: "Rupam Chandra", github: "rupam-backend" },
  { name: "Ujjwal Kumar", github: "rajkumarujjwaljime-tech" },
  { name: "Subhendu Sasmal", github: "subhendusasmal390-a11y" },
];

/** Derives up to two initials for the avatar placeholder. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * GitHub mark as inline SVG — lucide dropped brand icons in v1, so there is no
 * `Github` export to import.
 */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <Info className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h1
            className="text-4xl font-extrabold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            About Us
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Capacity Connect is a digital capacity-building and learning portal,
            built to connect trainees with expert trainers and make structured
            training easier to deliver, track, and verify.
          </p>
        </div>

        {/* Mission + What we built */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <section className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] p-8">
            <div className="w-10 h-10 mb-5 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Our Mission
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              To make professional capacity building accessible and measurable —
              giving trainees structured courses they can work through at their
              own pace, trainers the tools to build and manage that material, and
              administrators a clear view of progress across the whole
              organisation.
            </p>
          </section>

          <section className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] p-8">
            <div className="w-10 h-10 mb-5 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              What We Built
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              A role-based learning platform with course and module authoring,
              assessments with automatic grading, competency-based trainer
              matching, a shared resource library, and live progress dashboards —
              designed to stay usable on low-bandwidth connections.
            </p>
          </section>
        </div>

        {/* Team */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <Users className="w-7 h-7 text-[#a855f7]" />
          </div>
          <h2
            className="text-3xl font-extrabold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Team {TEAM_NAME}
          </h2>
          <p
            className="text-base max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Capacity Connect was designed and built by Team {TEAM_NAME} for the
            Smart India Hackathon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member) => (
            <div
              key={member.name}
              className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] p-6 flex flex-col items-center text-center"
            >
              <div
                className="relative w-16 h-16 mb-4 rounded-full overflow-hidden bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-lg font-extrabold text-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.12)]"
                aria-hidden="true"
              >
                {/* Initials sit underneath as the fallback layer — if the avatar
                    is missing or fails to load they simply show through. */}
                {initialsOf(member.name)}
                {member.github && (
                  <Image
                    src={`https://avatars.githubusercontent.com/${member.github}?s=160`}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              <p
                className="font-bold text-base mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {member.name}
              </p>

              {member.github ? (
                <a
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-[#a855f7]/40 hover:text-[#a855f7] transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <GithubMark className="w-4 h-4" />
                  <span>@{member.github}</span>
                </a>
              ) : (
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Team Member
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Want to know more about the platform?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            GET IN TOUCH
          </Link>
        </div>
      </div>
    </div>
  );
}
