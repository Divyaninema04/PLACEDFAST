# Phase 1: Analysis & Implementation Plan
## Cleanup, Backend Debugging, Google OAuth, and Supabase → MongoDB Migration

---

## 1. Project Scan & Asset Inventory

### A. Lovable-Specific Leftovers to Delete
| Path | Reason for Removal |
| :--- | :--- |
| `.lovable/` (entire directory) | Lovable builder project metadata and historical iteration prompt plans. Not used in standalone runtime. |
| `frontend/src/integrations/lovable/` (`index.ts`) | Proprietary Lovable preview auth client wrapper (`@lovable.dev/cloud-auth-js`). Does not function locally. |
| `frontend/src/integrations/supabase/previewAuthStorage.ts` | Lovable iframe broker using `postMessage` to sync sessions across `lovableproject.com`. Obsolete for standalone app. |
| `frontend/src/lib/lovable-error-reporting.ts` | Remote telemetry reporting uncaught errors to Lovable gateway. |
| `frontend/src/routes/README.md` | Lovable starter README detailing TanStack Start vs Next.js conventions. |
| `vercel.json` | Leftover deployment configuration preset for Lovable Nitro output. |
| `AGENTS.md` | Lovable Git synchronization warning file. |

### B. TanStack Query Analysis
- **Status: In Active Use on Frontend**.
- `@tanstack/react-query` is utilized across 10+ frontend route pages (`useQuery`, `useMutation`, `useQueryClient` in `dashboard.tsx`, `applications.tsx`, `companies.tsx`, `profile.tsx`, `academics.tsx`, etc.).
- There are **no unused query folders or boilerplate files**.
- **Refactoring Requirement**: Instead of TanStack Query executing browser-side Supabase queries (`supabase.from(...)`), all query functions will be redirected to call our new backend REST API endpoints via `apiRequest('/api/...')`.

### C. All Supabase-Related Files to Retire
| File / Directory | Description |
| :--- | :--- |
| `supabase/` (entire directory) | Contains `supabase/config.toml` and PostgreSQL migration SQL (`20260920000000_intelligence_platform_schema.sql`). |
| `frontend/src/integrations/supabase/client.ts` | Supabase browser client initialization. |
| `frontend/src/integrations/supabase/types.ts` | Supabase-generated PostgreSQL TypeScript schema types. |
| `frontend/src/integrations/supabase/` | Entire folder deleted after DB schema is converted to Mongoose models. |
| `backend/src/config/supabase.ts` | Supabase server/admin client initialization. |
| `backend/src/models/database.types.ts` | Supabase-generated PostgreSQL types copied to backend. |
| Environment variables | Remove `SUPABASE_*` and `VITE_SUPABASE_*` from root `.env`, `backend/.env`, and `frontend/.env`. |
| Package dependencies | Remove `@supabase/supabase-js` from `backend/package.json` and `frontend/package.json`. |

---

## 2. Root Cause Analysis

### Root Cause 1: Why the Backend is Not Starting / Running
1. **Port Conflict (`EADDRINUSE :::5000`)**:
   - When `npm run dev` was launched, a background Node process (`PID 22912`) occupied port 5000. Subsequent startup attempts threw unhandled exceptions: `Error: listen EADDRINUSE: address already in use :::5000`.
   - The backend entry point `backend/src/index.ts` currently lacks dynamic port fallback and graceful handling for occupied ports.
2. **Missing Backend CRUD Routes (Incomplete Full-Stack Surface)**:
   - In the initial TanStack Start architecture, all database operations (User profile, Applications, Academics, Semesters, Resumes, Roadmap progress) were performed directly from the browser using Supabase PostgREST client (`supabase.from(...)`).
   - The backend currently only has AI routes (`/api/companies`, `/api/mentor`, `/api/resume`, `/api/opportunities`). It lacks endpoints for authentication, profile management, applications tracking, academics, and resume storage. When the frontend attempts to communicate without Supabase, requests have nowhere to go.
3. **Missing Authentication & Token Secret**:
   - `backend/src/middleware/auth.middleware.ts` relied on calling Supabase `auth.getClaims(token)` over HTTP. If Supabase keys are invalid or absent, every authenticated route rejects with 401.

### Root Cause 2: Why Google OAuth is Failing
1. **Proprietary Cloud Sandbox Dependency**:
   - `frontend/src/routes/auth.tsx` calls `lovable.auth.signInWithOAuth("google")` which imports `@lovable.dev/cloud-auth-js`.
   - This package is a proxy that only operates within Lovable's hosted preview iframe (`https://*.lovableproject.com`).
   - Running on `localhost:5173`, the SDK throws an exception, triggering the catch block: `"Google OAuth is disabled locally — entering as Demo Student"`.
2. **Absence of Standard OAuth 2.0 Backend Handlers**:
   - There is no Passport strategy, no `google-auth-library`, and no Google OAuth redirect/callback route on the backend (`/api/auth/google`, `/api/auth/google/callback`).
   - There are no environment variables configured for `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`.

---

## 3. Step-by-Step MongoDB Migration Plan

Every Supabase relational table is mapped directly to a strongly-typed **Mongoose Schema & Model** under `backend/src/models/`:

```
backend/src/models/
├── User.ts                 # Replaces profiles + Supabase auth.users
├── Company.ts              # Replaces companies table
├── Application.ts          # Replaces applications table
├── Opportunity.ts          # Replaces opportunities table
├── SavedOpportunity.ts     # Replaces saved_opportunities table
├── Semester.ts             # Replaces semesters table
├── Subject.ts              # Replaces subjects table
├── Resume.ts               # Replaces resumes table
├── ResumeVersion.ts        # Replaces resume_versions table
├── RoadmapProgress.ts      # Replaces roadmap_progress table
└── MarketData.ts           # Replaces sectors, districts, job_roles tables
```

### Detailed Schema Conversion Mapping

#### 1. User & Profile (`User.ts`)
- **Replaces**: Supabase `auth.users` + `public.profiles`.
- **Fields**:
  - `email`: `{ type: String, required: true, unique: true, lowercase: true }`
  - `password`: `{ type: String, select: false }` (hashed with bcrypt; optional for OAuth users)
  - `googleId`: `{ type: String, unique: true, sparse: true }`
  - `fullName`: `String`
  - `avatar`: `String`
  - `college`: `String`, `university`: `String`, `branch`: `String`, `degree`: `String`, `course`: `String`
  - `yearOfStudy`: `Number`, `currentSemester`: `Number`, `graduationYear`: `Number`
  - `cgpa`: `Number`
  - `skills`: `[String]`, `achievements`: `[String]`
  - `projects`: `[{ title: String, description: String, techStack: [String], link: String }]`
  - `certifications`: `[{ name: String, issuer: String, issueDate: Date, url: String }]`
  - `codingProfiles`: `[{ platform: String, handle: String, url: String }]`
  - `dreamCompanies`: `[String]`, `preferredRoles`: `[String]`, `careerInterests`: `[String]`
  - `state`: `String`
  - Timestamps: `createdAt`, `updatedAt`

#### 2. Company (`Company.ts`)
- **Replaces**: `public.companies`.
- **Fields**:
  - `slug`: `{ type: String, required: true, unique: true, index: true }`
  - `name`: `{ type: String, required: true }`
  - `industry`: `String`
  - `description`: `String`
  - `website`: `String`, `careersUrl`: `String`, `hqLocation`: `String`
  - `minCgpa`: `Number`
  - `allowedBranches`: `[String]`, `techStack`: `[String]`
  - `salaryMin`: `Number`, `salaryMax`: `Number`
  - `hiringSeason`: `String`
  - `processSteps`: `[String]`, `dsaTopics`: `[String]`, `csSubjects`: `[String]`
  - `verificationStatus`: `{ type: String, default: "verified" }`
  - Timestamps: `createdAt`, `updatedAt`

#### 3. Application (`Application.ts`)
- **Replaces**: `public.applications`.
- **Fields**:
  - `userId`: `{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }`
  - `companyName`: `{ type: String, required: true }`
  - `companyId`: `{ type: Schema.Types.ObjectId, ref: 'Company' }`
  - `role`: `{ type: String, required: true }`
  - `status`: `{ type: String, enum: ['applied', 'assessment', 'interview', 'offer', 'rejected'], default: 'applied' }`
  - `packageLpa`: `Number`
  - `location`: `String`
  - `appliedDate`: `Date`
  - `nextStep`: `String`, `nextStepDate`: `Date`
  - `notes`: `String`
  - Timestamps: `createdAt`, `updatedAt`

#### 4. Opportunity (`Opportunity.ts`) & SavedOpportunity (`SavedOpportunity.ts`)
- **Replaces**: `public.opportunities` and `public.saved_opportunities`.
- **Fields**:
  - `title`: `String`, `organization`: `String`, `category`: `String`
  - `description`: `String`, `eligibilityText`: `String`, `deadline`: `String`
  - `location`: `String`, `state`: `String`, `educationLevel`: `String`
  - `branches`: `[String]`, `minCgpa`: `Number`, `graduationYears`: `[Number]`
  - `applyUrl`: `String`, `sourceName`: `String`, `sourceUrl`: `String`
  - `verificationStatus`: `String`, `lastVerifiedAt`: `Date`
  - `eligibility`: `Schema.Types.Mixed`

#### 5. Academics: Semester (`Semester.ts`) & Subject (`Subject.ts`)
- **Replaces**: `public.semesters` and `public.subjects`.
- **Fields**:
  - `Semester`: `userId`, `number`, `label`, `gpa`, `credits`, `status`, `backlogsCount`.
  - `Subject`: `userId`, `semesterId`, `name`, `code`, `credits`, `progress`, `interviewTopics` (`[String]`), `resources` (`Schema.Types.Mixed`).

#### 6. Resumes: Resume (`Resume.ts`) & ResumeVersion (`ResumeVersion.ts`)
- **Replaces**: `public.resumes` and `public.resume_versions`.
- **Fields**:
  - `Resume`: `userId`, `fileName`, `fileUrl`, `isPrimary`, `atsScore`, `targetRole`, `parsedSkills`.
  - `ResumeVersion`: `userId`, `label`, `targetRole`, `sections` (`Schema.Types.Mixed`), `aiSuggested` (`Schema.Types.Mixed`).

#### 7. RoadmapProgress (`RoadmapProgress.ts`)
- **Replaces**: `public.roadmap_progress`.
- **Fields**: `userId`, `stageKey`, `progress`, `completedMilestones` (`[String]`).

---

## 4. Phased Order of Operations

### Phase 2: Cleanup
1. Delete `.lovable/` folder, `frontend/src/integrations/lovable/`, `frontend/src/lib/lovable-error-reporting.ts`.
2. Delete `frontend/src/integrations/supabase/previewAuthStorage.ts`.
3. Delete `supabase/` folder, `frontend/src/integrations/supabase/`, and backend Supabase configs once models are structured.
4. Remove `@lovable.dev/cloud-auth-js` and `@supabase/supabase-js` from `frontend/package.json` and `backend/package.json`.
5. Clean obsolete root configs (`vercel.json`, `AGENTS.md`).

### Phase 3: Backend Fix & Core REST Endpoints
1. Resolve port conflict on 5000 (kill stale process PID 22912 or configure port fallback in `backend/src/index.ts`).
2. Add standalone JWT authentication (`jsonwebtoken` + `bcryptjs`) for email/password signup and login.
3. Build complete REST controllers and routes for all resources currently called by the frontend:
   - `auth.routes.ts` (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
   - `profile.routes.ts` (`/api/profile`)
   - `company.routes.ts` (`/api/companies`)
   - `application.routes.ts` (`/api/applications`)
   - `academic.routes.ts` (`/api/academics/semesters`, `/api/academics/subjects`)
   - `resume.routes.ts` (`/api/resumes`, `/api/resumes/versions`)
   - `roadmap.routes.ts` (`/api/roadmap`)
   - `opportunity.routes.ts` (`/api/opportunities`, `/api/opportunities/saved`)
4. Verify backend server starts cleanly and `/api/health` returns status `200`.

### Phase 4: Google OAuth Implementation
1. Install `google-auth-library` (or Passport Google Strategy).
2. Implement backend endpoint `POST /api/auth/google` (verifies Google ID token from frontend client or handles OAuth code exchange).
3. Update `frontend/src/routes/auth.tsx` with standard Google Sign-In button (using Google Identity Services / `@react-oauth/google` or backend redirect flow).
4. Issue local JWT session upon successful Google authentication.

### Phase 5: MongoDB & Mongoose Migration
1. Install `mongoose` in `backend/`.
2. Configure `backend/src/config/db.ts` with `mongoose.connect(process.env.MONGODB_URI)`.
3. Implement all Mongoose models in `backend/src/models/`.
4. Connect all controllers to MongoDB Mongoose models.
5. In `frontend/`, update all `useQuery` / `useMutation` calls to fetch via `apiRequest('/api/...')` instead of `supabase.from(...)`.
6. Update `.env` and `.env.example` with `MONGODB_URI`.

### Phase 6: Verification & NEXT-STEPS.md
1. Verify backend starts with MongoDB connected.
2. Verify frontend builds and runs against backend.
3. Test authentication, profile updates, application tracking, and AI mentor endpoints.
4. Output `NEXT-STEPS.md` documenting manual setup items.

---

## 5. Manual Steps Required (Flagged for User)

> [!IMPORTANT]
> ### MANUAL STEPS REQUIRED BY YOU (THE USER):
> 1. **MongoDB Connection String (`MONGODB_URI`)**:
>    - You will need a running MongoDB instance: either a free **MongoDB Atlas** cluster URL or a local instance (`mongodb://localhost:27017/placementpilot`).
>    - Add `MONGODB_URI=mongodb://localhost:27017/placementpilot` to `backend/.env`.
> 2. **Google Cloud Console Credentials for OAuth**:
>    - Go to [Google Cloud Console](https://console.cloud.google.com/) -> APIs & Services -> Credentials.
>    - Create an **OAuth 2.0 Client ID** (Web application).
>    - Add Authorized JavaScript Origin: `http://localhost:5173` and `http://localhost:5000`.
>    - Add Authorized Redirect URI: `http://localhost:5173` (or `http://localhost:5000/api/auth/google/callback`).
>    - Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `backend/.env` and `VITE_GOOGLE_CLIENT_ID` into `frontend/.env`.
> 3. **Exporting Existing Supabase Data (If Any)**:
>    - If you have real student or company data stored in your remote Supabase project, you can export it as JSON or CSV from the Supabase Studio dashboard (Table Editor -> Export to CSV).
>    - If you are using seed/demo data, no export is required; we will provide an automated seed script for MongoDB!
