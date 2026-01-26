# PromoLink / Mykalat — Project Handover Documentation

_Last updated: 2026-01-22_

## 1) What this project is

PromoLink (app title: **Mykalat**) is a Next.js (App Router) web application connecting **businesses** and **influencers**.

High-level capabilities present in the codebase:

- Authentication (email/password + passkeys) with role-based routing (business vs influencer).
- Marketplace-like flows (jobs, proposals, contracts, goals, earnings).
- Messaging (1:1 conversations + realtime updates via Pusher).
- File uploads (Cloudinary).
- Transactional email (Resend) used for email verification.

## 2) Tech stack (runtime)

### Frontend

- **Next.js 15** (App Router) + **React 19**
- **TypeScript 5**
- UI:
  - **Tailwind CSS v4** (CSS-first configuration)
  - **shadcn/ui** style: `new-york` (see `components.json`)
  - **Radix UI** primitives
  - Icons: **Lucide**, **Phosphor Icons**, `react-icons`
  - Animation: **framer-motion** / `motion`
- Data fetching / caching: **@tanstack/react-query**

### Backend (within Next.js)

- Next.js **Route Handlers** under `src/app/api/**`
- Database: **MongoDB** via **Mongoose**
- Auth: **better-auth** with MongoDB adapter
- Realtime: **Pusher** (server + client)
- Email: **Resend**
- Media upload: **Cloudinary**

## 3) Developer tooling

- Package manager: npm (project includes `package-lock.json` only if you add it; currently not shown in tree)
- Linting: `next lint` (note: the current `eslint.config.mjs` may behave like an empty config, so Next’s ESLint plugin warning can appear even when lint passes)
- Styling: Tailwind v4 via PostCSS plugin (`postcss.config.mjs`)

## 4) Key project layout

- `src/app/` — Next.js routes and layouts
  - `src/app/page.tsx` — Landing page
  - `src/app/(auth)/` — Auth route group (signin/signup, verify email)
  - `src/app/business/` — Business area
  - `src/app/influencer/` — Influencer area
  - `src/app/api/` — API routes (Route Handlers)
- `src/components/` — Shared UI/components (includes `components/ui/` shadcn primitives)
- `src/context/` — Context providers (currently used for `User` only; other domain contexts were removed in favor of React Query hooks)
- `src/hooks/` — Custom hooks (React Query hooks live here)
- `src/lib/` — Integrations and utilities
  - `mongoose.ts` — MongoDB connection
  - `auth.ts` / `auth-client.ts` — better-auth configuration + client
  - `pusher.ts` — Pusher server/client setup
  - `email-service.ts` — Resend mail sender
  - `apiClient.ts` — fetch wrapper for `/api/*`
- `src/models/` — Mongoose schemas/models
- `src/types/` — Shared TypeScript types

Path alias:

- `@/*` maps to `src/*` (see `tsconfig.json`).

## 5) Authentication & routing behavior

### Auth provider

Server config is in `src/lib/auth.ts`:

- Uses **better-auth** with **MongoDB adapter**.
- Enables `emailAndPassword`.
- Enables **passkeys** via plugin.
- Email verification is wired to Resend via `emailVerification.sendVerificationEmail`.
- User “role” is stored as an additional field, defaulting to `influencer`.

### Redirect flow

- `src/middleware.ts` reads the session cookie via `better-auth/cookies`.
  - If the user is not authenticated and visits `/business/*` or `/influencer/*`, they are redirected to `/auth`.
  - If authenticated and visiting `/` or `/auth*`, they are redirected to `/api/auth/callback`.
- `src/app/api/auth/callback/route.ts` checks the session and redirects:
  - `business` → `/business`
  - `influencer` → `/influencer`

### Important handover note

`trustedOrigins` in `src/lib/auth.ts` contains a hard-coded allowlist of local IPs and deployed URLs. When transferring ownership or changing domains, update this list.

## 6) Database & models

### MongoDB connection

- `src/lib/mongoose.ts` reads `MONGODB_URI` and uses a global cache to reuse the connection.

### Collections/models

Models live in `src/models/*`:

- `UserSchema.ts`: A **generic** model bound to collection `user` with `strict: false`.
  - This appears designed to interoperate with the user collection used by better-auth.
  - It includes at least `savedJobs` and allows additional fields.
- `JobSchema.ts`: Jobs posted by businesses; includes `postedBy`, `status`, social platforms, hired influencers, and proposal references.
- `ProposalSchema.ts`: Proposals to jobs (`pending/accepted/rejected`).
- `ConversationSchema.ts` + `MessageSchema.ts`: 1:1 messaging.
- `ContractSchema.ts`: Contract terms and status transitions (`draft/active/completed/terminated`).
- `Goal.ts`: Business goals (tracks target/current values).
- `EarningSchema.ts`: Earnings entries (`paid/unpaid`).

## 7) Realtime messaging (Pusher)

- Pusher setup: `src/lib/pusher.ts`
- Message creation route: `src/app/api/message/route.ts`
  - Writes message to MongoDB.
  - Triggers realtime events:
    - `conversation-{conversationId}`: `new-message`
    - `user-{participantId}`: `conversation-updated`
- Conversation creation route: `src/app/api/conversation/route.ts`
  - Creates/retrieves a 1:1 conversation and triggers `user-{id}`: `new-conversation`.

Client-side messaging state is handled via React Query in `src/hooks/useMessages.ts` (not React Context).

## 7.1) API response shape (important)

`src/lib/apiClient.ts` expects API routes to return the shape:

```json
{ "data": "..." }
```

Several routes in `src/app/api/**` were updated to follow this consistently so React Query hooks can rely on `apiClient`.

## 8) File uploads (Cloudinary)

- Upload route: `src/app/api/upload/route.ts`
  - Expects `multipart/form-data` with a `file` field.
  - Returns `{ url, publicId }`.
- `next.config.ts` allows remote images from `res.cloudinary.com`.

## 9) Email (Resend)

- Email sender: `src/lib/email-service.ts`
  - Uses `RESEND_API_KEY`.
  - Sender is hard-coded as `onboarding@fikiryilkal.me`.

Handover checklist item: the new owner should update the “from” address to a domain they control and verify it in Resend.

## 10) Environment variables (.env)

Create a local `.env.local` (for development) or set production env vars in your hosting platform.

Required:

- `MONGODB_URI` — MongoDB connection string
- `RESEND_API_KEY` — Resend API key
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_PUSHER_APP_ID`
- `NEXT_PUBLIC_PUSHER_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `PUSHER_SECRET`

Notes:

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 11) Local development

### Prerequisites

- Node.js: use a modern LTS (recommended Node 20+). Next.js 15 requires Node 18+.
- A MongoDB database (Atlas or self-hosted).
- Resend account + API key (for verification emails).
- Cloudinary account + credentials (for uploads).
- Pusher Channels app credentials (for realtime messaging).

### Install and run

```bash
npm install
npm run dev
```

App will start on `http://localhost:3000`.

### Production build

```bash
npm run build
npm run start
```

## 12) Deployment notes

This app is compatible with common Next.js hosts (e.g., Vercel).

When deploying:

- Ensure all environment variables from section 10 are configured.
- Update `trustedOrigins` in `src/lib/auth.ts` to include the production domains.
- Confirm Resend “from” identity is verified for the deployment domain.

## 13) Ownership transfer checklist

- Rotate all secrets:
  - MongoDB user/password / connection string
  - Resend API key
  - Cloudinary API secret
  - Pusher secret
- Update allowed origins in `src/lib/auth.ts`.
- Update sender address in `src/lib/email-service.ts`.
- Confirm the MongoDB database (and collections) ownership and backups are transferred.
- Confirm deployment ownership transfer (Vercel/hosting project, domains, DNS).

## 14) Quick pointers for new maintainers

- API routes: start in `src/app/api/*`.
- Auth logic: `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client).
- Messaging: `src/app/api/message/route.ts`, `src/app/api/conversation/route.ts`, and `src/hooks/useMessages.ts`.
- Proposals: `src/app/api/proposal/*` and `src/hooks/useProposals.ts`.
- Contracts: `src/app/api/contract/*` and `src/hooks/useContracts.ts`.
- Influencers: `src/app/api/influencer/route.ts` and `src/hooks/useInfluencers.ts`.
- Uploads: `src/app/api/upload/route.ts`.

## 15) Database model — details & data flow

### Entities

- User: see [src/models/UserSchema.ts](src/models/UserSchema.ts)
  - Collection: `user` (lowercase), `strict: false` to accommodate auth provider fields.
  - Fields: `savedJobs` — array of ObjectId refs to `Job`.
  - Role handling: stored alongside the auth user document; used to route (`business` vs `influencer`).

- Job: see [src/models/JobSchema.ts](src/models/JobSchema.ts)
  - Fields: `title`, `description`, `price`, optional `location`, `socialMedia.platform` (instagram|youtube|tiktok|telegram).
  - Relations: `postedBy` → `User`, `goalId` → `BusinessGoal`, `hiredInfluencers` → [`User`], `proposalsSubmitted` → [{ `proposal` → `Proposal`, `influencer` → `User` }].
  - Status: `open|in-progress|completed|cancelled`, progress via `statusInPercent`.

- Proposal: see [src/models/ProposalSchema.ts](src/models/ProposalSchema.ts)
  - Relations: `jobId` → `Job`, `influencerId` → `User`.
  - Status: `pending|accepted|rejected`.

- Contract: see [src/models/ContractSchema.ts](src/models/ContractSchema.ts)
  - Core refs: `senderId` → `Proposal`, `reciverId` → `Proposal`.
  - Terms: `price`, `socialMediaActions[]` (platform/actionType/quantity), `deadline`.
  - Status: `draft|active|completed|terminated`; confirmations: `influencerConfirmed`, `ownerConfirmed`.
  - Hook: `pre('save')` sets `activatedAt` on first active, `completedAt` when both parties confirm, `terminatedAt` when terminated.

- Conversation: see [src/models/ConversationSchema.ts](src/models/ConversationSchema.ts)
  - Fields: `participants` — exactly two distinct `User` ids; `lastMessage` with default.
  - Indexes: `{ participants: 1 }`, `{ updatedAt: -1 }`.

- Message: see [src/models/MessageSchema.ts](src/models/MessageSchema.ts)
  - Relations: `conversationId` → `Conversation`, `senderId` → `User`.
  - Fields: `content` (1–2000 chars), `status.delivered`, `status.read`.
  - Indexes: `{ conversationId: 1, createdAt: -1 }`, `{ senderId: 1 }`.

- Earnings: see [src/models/EarningSchema.ts](src/models/EarningSchema.ts)
  - Relations: `userId` → `User`.
  - Fields: `amount`, `status` (`paid|unpaid`), `paymentDate` required when `status=paid`, `source`, `metadata`.

- BusinessGoal: see [src/models/Goal.ts](src/models/Goal.ts)
  - Relations: `businessId` → `Business` (note: if business users live in the `user` collection, you may align this ref or introduce a dedicated `Business` model).
  - Fields: `targetValue`, `currentValue`, `unit`, `startDate`, `estimatedEndDate`, optional `isCompleted`.

### Relationships & flow

- Jobs are posted by business users (`postedBy`), influencers submit proposals (`Proposal`).
- Accepted proposals lead to contracts (`Contract`) that become `active` when appropriate confirmations occur.
- Coordination happens via 1:1 conversations (`Conversation`) and messages (`Message`).
- When payments are made, earnings entries (`Earnings`) are recorded for the influencer.
- Goals: `Job.goalId` links a job to a business goal; `goalContributionPercent` and `statusInPercent` can be used (by business logic) to update `BusinessGoal.currentValue`.
- Bookmarks: `User.savedJobs` store job bookmarks for quick access.

### Indexes & integrity

- Messaging indices support fast conversation lookups and chronological message retrieval.
- Enums enforce domain consistency (social platforms, statuses).
- Contract pre-save hook ensures timestamps and status transitions are coherent.

### Operational notes

- Connection management: see [src/lib/mongoose.ts](src/lib/mongoose.ts); global connection cache is used to avoid reconnections.
- Collection naming: `User` model maps to the `user` collection.
- Reference alignment: ensure `BusinessGoal.businessId` points to your chosen business representation (either a dedicated model or `User` with role=`business`).
- API routes under `src/app/api/**` should create/read/update these relationships; see the corresponding handlers for exact flows.

