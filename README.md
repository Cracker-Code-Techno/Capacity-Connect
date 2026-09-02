# Capacity Connect

A high-performance Digital Capacity Building and Learning Management Portal built with Next.js 16, Prisma, and Supabase.

## Features

- **Auth & Roles** — NextAuth Credentials with JWT sessions, email verification + password reset (Nodemailer), role-based access (Trainee / Trainer / Admin) in `src/proxy.ts`.
- **Trainees** — Course catalog, enrollment, module-by-module progress tracking, assessments with attempts and due-date enforcement, course reviews, profile (qualifications, experience, certificates, skills, interests).
- **Trainers** — Course authoring (modules, assessments with `dueDate` / `maxAttempts` / `passingScore`), subject tagging, per-course resources, public trainer profile + library.
- **Admins** — User management with last-admin guard, subjects CMS, achievements + homepage highlights CMS, competency match by subject, broadcast announcements.
- **Homepage CMS** — Admin-curated "Newly Added Content" carousel + "Achievements" strip.
- **File storage** — Vercel Blob in production; falls back to `public/uploads/` in local dev when `BLOB_READ_WRITE_TOKEN` is not set.
- **Security** — Per-IP + per-email rate-limiting on login (5/15 min) and signup; Origin-based CSRF on all mutating `/api/*` routes (server-to-server with no Origin is allowed by design).
- **UX** — Dark / light theme, shared `useToast` for non-blocking notifications, server-validated forms with Zod.

## Tech stack

See `technologies.txt` for a full list.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment variables

Create a `.env` file:

```env
# Database (Supabase)
capacity_connect_POSTGRES_PRISMA_URL="postgres://...?sslmode=require&pgbouncer=true"
DIRECT_URL="postgres://...?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="some-long-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Email (Nodemailer) — for verification + password reset
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="user"
EMAIL_SERVER_PASSWORD="pass"
EMAIL_FROM="no-reply@capacity-connect.app"

# Vercel Blob (optional in dev — falls back to public/uploads/)
BLOB_READ_WRITE_TOKEN=""
```

### 3. Database

```bash
# Apply migrations
npx prisma migrate deploy

# Seed an admin + sample data
npm run seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run seed` | Seed database |

## Project structure

```
prisma/                  — schema + migrations + seed
src/
  app/                   — App Router (pages + API routes)
    (auth)/              — login, signup, verify-email, reset-password
    (dashboard)/         — admin, trainer, trainee panels
    api/                 — serverless handlers
    profile/             — trainee/trainer profile editor
    subjects/            — public subject browse + detail
    trainer/library/     — trainer resource library
  components/            — reusable UI (global, library, courses, subjects, profile)
  lib/                   — auth, prisma, rate-limit, blob, sanitize, validators
  types/                 — TypeScript augmentations (next-auth)
  proxy.ts               — Next 16 middleware (renamed from middleware.ts)
```

## Notes

- **Middleware file** — Next.js 16 renamed `middleware.ts` to `proxy.ts`. This repo uses `src/proxy.ts` exporting `proxy()`. Do not add a `src/middleware.ts` file.
- **Rate-limit memory** — `src/lib/rate-limit.ts` uses an in-memory map. In Vercel's serverless environment, state does not survive cold starts across instances; this is a known limitation.
- **Image domains** — `next.config.ts` allows Unsplash, Supabase storage, GitHub avatars, and Vercel Blob public URLs.
- **Email** — Outbound mail uses Nodemailer; configure SMTP via `EMAIL_SERVER_*` env vars.

## Deploy on Vercel

The project is preconfigured for Vercel (`vercel.json` sets `buildCommand: "next build"`, `installCommand: "npm install"`). Required env vars (see above) must be set in the Vercel project settings. The Prisma client is generated automatically via the `postinstall` script.
