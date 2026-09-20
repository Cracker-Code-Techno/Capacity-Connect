# Capacity Connect

A modern, high-performance **Digital Capacity Building and Learning Management Portal (LMS)** built with **Next.js 16 (App Router)**, **React 19**, **Prisma ORM**, and **PostgreSQL (Supabase)**.

Developed by team **Code Crackers**.

🌐 **Live Deployment:** [https://capacity-connect.vercel.app](https://capacity-connect-pi.vercel.app)

---

## 🌟 Key Features

### 👥 Three Distinct User Roles

- **Trainee Portal (`/trainee`)**
  - Interactive dashboard showing current enrollments, completed courses, and overall progress.
  - Course catalog exploration with instant search, category filtering, and one-click enrollment.
  - Module-by-module learning progression with automated completion tracking.
  - Comprehensive assessments with time windows, max attempt caps, passing thresholds, and immediate scoring.
  - Course rating and review system with verified enrollment badges.
  - Rich trainee profile: qualifications, work experience, certificates, skills, and areas of interest.

- **Trainer Portal (`/trainer`)**
  - Course authoring studio: create, edit, and publish multi-module courses.
  - Assessment builder: craft MCQs with multiple choices, answer validation, passing criteria, and attempt restrictions.
  - Resource manager: upload, categorize, and link course collateral (PDFs, docs, external links) backed by cloud or local storage.
  - Subject tagging and competency profiles.
  - Public trainer profile showcasing authored courses, bio, and ratings.

- **Admin Portal (`/admin`)**
  - Global user management: view, search, and update roles (`TRAINEE`, `TRAINER`, `ADMIN`) with built-in last-admin protection.
  - Platform announcements: broadcast announcements to platform users.
  - Subject taxonomy management: add, edit, and categorize platform subjects.
  - Content CMS: manage "Newly Added Content" carousels and "Platform Achievements" on the landing page.
  - Competency Matching Engine: discover and rank trainers by evaluated subject competency to assign optimal instructors.

### 🔐 Authentication & Security

- **NextAuth.js (v4)**: Credentials provider with edge-compatible JWT session tokens.
- **Account Verification**: Secure email verification workflow via Nodemailer (24-hour token expiry).
- **Password Reset**: Single-use tokenized password reset links (1-hour expiry).
- **Next.js 16 Edge Proxy (`src/proxy.ts`)**: Role-Based Access Control (RBAC) routing guard and cross-origin (CSRF) protection on mutating API routes.
- **Rate Limiting**: In-memory sliding-window rate limiting on sensitive auth endpoints (5 attempts per 15 minutes).
- **Data Validation & Sanitization**: Zod schemas on all API boundaries and user inputs.
- **Security Headers**: Production-hardened HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict Referrer policy).

### 🎨 Design & Experience

- **Tailwind CSS v4** & Glassmorphic modern aesthetic.
- **Dark / Light Mode** switching powered by `next-themes` with zero hydration flicker.
- **Framer Motion**: Smooth animations, micro-interactions, and draggable reordering.
- **Toast Notification System**: Accessible, non-blocking floating alerts for feedback.
- **Vercel Blob Storage**: Cloud asset storage in production with seamless fallback to `public/uploads/` during local development.

---

## 🛠️ Technology Stack

Detailed breakdown available in [`technologies.txt`](./technologies.txt).

| Component | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16.3.3 | App Router, React Server Components, Serverless Route Handlers |
| **Frontend** | React 19.2.8 | UI component library |
| **Language** | TypeScript 5.x | Strict-mode type safety |
| **Styling** | Tailwind CSS v4 | Utility-first CSS via `@tailwindcss/postcss` |
| **Animations** | Framer Motion 13.1 | Motion components, gesture interactions |
| **Database** | PostgreSQL | Hosted on Supabase (PgBouncer connection pooling) |
| **ORM** | Prisma 5.10 | Type-safe query builder and schema migrations |
| **Authentication**| NextAuth.js 4.24 | JWT session strategy, bcryptjs password hashing |
| **Email Service** | Nodemailer | Transactional emails for account verification & password reset |
| **Storage** | @vercel/blob 2.8 | Cloud object storage with local filesystem dev fallback |
| **Validation** | Zod 4.5 | Request and schema validation |
| **Testing** | Vitest 4 + Playwright 1.62 | Unit/component tests and end-to-end browser automation |
| **Code Quality** | ESLint 9, Husky 9, lint-staged 17 | Automated pre-commit linting and pre-push typechecking |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL Database**: Local or hosted (e.g., Supabase)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/Capacity-Connect.git
cd Capacity-Connect
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Database (PostgreSQL via Supabase)
capacity_connect_POSTGRES_PRISMA_URL="postgres://user:password@host:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgres://user:password@host:5432/postgres?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-a-secure-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Service (Nodemailer - e.g. Gmail with App Password)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Capacity Connect <noreply@yourdomain.com>"

# Cloud Storage (Vercel Blob — optional in local dev)
BLOB_READ_WRITE_TOKEN=""
```

> **Note on Storage:** If `BLOB_READ_WRITE_TOKEN` is left empty in development, uploaded files will automatically be saved locally to `public/uploads/`.

### 3. Initialize & Seed Database

Apply Prisma migrations to create the database schema:

```bash
npx prisma migrate deploy
```

Seed the database with default roles, demo accounts, sample subjects, and courses:

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Seed Credentials

After running `npm run seed`, you can sign in using these pre-configured accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@capacityconnect.com` | `password123` |
| **Trainer** | `trainer@capacityconnect.com` | `password123` |
| **Trainee** | `trainee@capacityconnect.com` | `password123` |

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| **dev** | `npm run dev` | Start Next.js development server on port 3000 |
| **build** | `npm run build` | Build the optimized production application |
| **start** | `npm run start` | Launch the production build server |
| **lint** | `npm run lint` | Check code with ESLint rules |
| **typecheck** | `npm run typecheck` | Run TypeScript compiler check without emit (`tsc --noEmit`) |
| **test** | `npm run test` | Run unit and component test suites via Vitest |
| **test:watch** | `npm run test:watch` | Run Vitest in interactive watch mode |
| **test:e2e** | `npm run test:e2e` | Run End-to-End browser test suite via Playwright |
| **seed** | `npm run seed` | Seed database with sample data via `prisma/seed.ts` |
| **postinstall**| `prisma generate` | Automatically regenerate Prisma Client after package install |

---

## 📂 Project Structure

```
Capacity-Connect/
├── prisma/
│   ├── schema.prisma            # 16 Relational models & database indexes
│   ├── seed.ts                  # Database seeder with demo accounts & courses
│   └── migrations/              # Prisma SQL migration history
├── public/
│   ├── uploads/                 # Local dev file upload storage fallback
│   └── (static assets)          # Icons, logos, and images
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Login, signup, verify-email, reset-password
│   │   ├── (dashboard)/         # Protected dashboards: /admin, /trainer, /trainee
│   │   ├── api/                 # 40+ REST API serverless route handlers
│   │   ├── courses/             # Public course catalog & course detail
│   │   ├── subjects/            # Public subjects explorer & taxonomy
│   │   ├── trainer/             # Public trainer profile pages
│   │   ├── profile/             # Trainee/Trainer profile editor
│   │   ├── about/               # Platform about page
│   │   ├── contact/             # Contact page
│   │   ├── faq/                 # Frequently asked questions
│   │   ├── privacy/             # Privacy policy
│   │   ├── globals.css          # Tailwind 4 theme tokens, glassmorphism styles
│   │   ├── layout.tsx           # Root layout with theme & session providers
│   │   ├── proxy.ts             # Next.js 16 Edge proxy (RBAC + CSRF protection)
│   │   ├── robots.ts            # Dynamic SEO robots configuration
│   │   └── sitemap.ts           # Dynamic SEO sitemap generator
│   ├── components/              # Modular UI components
│   │   ├── global/              # Navbar, Footer, ThemeToggle, ToastContainer
│   │   ├── courses/             # FeedbackForm, FeedbackList, RatingStars
│   │   ├── library/             # ResourceList, ResourceUploader
│   │   ├── subjects/            # SubjectChips, SubjectPicker
│   │   └── providers/           # SessionProvider, ThemeProvider
│   ├── lib/                     # Utilities and backend helpers
│   │   ├── auth.ts              # NextAuth options and session verification
│   │   ├── prisma.ts            # Global Prisma Client singleton
│   │   ├── email.ts             # Resend transactional email integration
│   │   ├── tokens.ts            # Verification & reset token generators
│   │   ├── blob.ts              # Vercel Blob cloud upload with local fallback
│   │   ├── rate-limit.ts        # In-memory rate limiting implementation
│   │   ├── sanitize.ts          # HTML and text sanitization helpers
│   │   └── validators/          # Zod schemas (profile, learning, resources)
│   └── types/                   # TypeScript declarations & NextAuth augmentations
├── next.config.ts               # Remote image patterns and security headers
├── playwright.config.ts         # Playwright test configuration
├── vitest.config.ts             # Vitest test configuration
├── vercel.json                  # Vercel deployment configuration
└── package.json                 # Project dependencies and npm scripts
```

---

## 🔒 Security Architecture

1. **Proxy Protection (`src/proxy.ts`)**:
   - In Next.js 16, proxy functionality is standardly handled in `src/proxy.ts` (exporting `proxy()`).
   - All mutating API calls (`POST`, `PUT`, `PATCH`, `DELETE`) are inspected for trusted `Origin` and `Host` headers to prevent CSRF attacks.
   - Dashboard routes (`/admin/*`, `/trainer/*`, `/trainee/*`) enforce user authentication and role verification before rendering.

2. **Authentication Tokens**:
   - Verification tokens expire automatically after 24 hours.
   - Password reset tokens expire after 1 hour and are invalidated immediately upon use.

3. **Rate Limiting**:
   - Sensitive endpoints (such as `/api/auth/*` and signup routes) use rate limiting to protect against brute-force and credential stuffing attempts.

---

## 🚢 Deployment on Vercel

1. Push your repository to GitHub / GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add the variables specified in `.env.example`:
   - `capacity_connect_POSTGRES_PRISMA_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production domain, e.g. `https://capacity-connect.vercel.app`)
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_SECURE`
   - `EMAIL_FROM`
   - `BLOB_READ_WRITE_TOKEN`
4. The project is pre-configured via `vercel.json` and package scripts (`postinstall: prisma generate`).
5. Deploy and verify the build logs.
