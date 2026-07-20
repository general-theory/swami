# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Swami is a college football pick'em/wagering pool app. Users join leagues, place spread wagers on games each week with a virtual balance, and standings are tracked per league/season. Built with Next.js (App Router), TypeScript, Prisma/MySQL, Clerk auth, and Tailwind/DaisyUI.

## Commands

```bash
npm run dev      # start dev server (next dev)
npm run build    # production build (runs prisma generate via postinstall separately)
npm run start    # run production build
npm run lint     # next lint
npx prisma generate            # regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>   # create + apply a migration in dev
```

There is no test suite configured in this repo.

## Architecture

**Domain model** (`prisma/schema.prisma`): `Season` → `Week` → `Game` is the core schedule hierarchy. `League` and `UserParticipation` scope users to a league/season with a virtual `balance` (starts at 1000). `Wager` ties a `User` + `Game` + `League` to a `pick` ("home" or "visit") and `amount`. A `UserParticipation.balance <= -1000` means the user is "out of the game" and blocked from further wagers (enforced in `app/api/wagers/route.ts`).

**Auth**: Clerk (`@clerk/nextjs`). `middleware.ts` protects `/admin(.*)` routes via `clerkMiddleware`/`createRouteMatcher`. API routes authenticate individually with `auth()` from `@clerk/nextjs/server`, then resolve the app's internal `User` row via `clerkId` — the Clerk `userId` is never used directly as the app user id.

**External data sync**: `lib/sync/games.ts` pulls schedule/score data from the CollegeFootballData API (`CFBD_API_KEY`) and upserts into `Game` by `providerGameId`, matching teams by `Team.providerId`. Week 16 is special-cased to mean postseason/bowl week (`seasonType=postseason`, `week=1`) rather than a literal week 16 — see the `fixed api pull during bowlweek` history around this. A Vercel cron (`vercel.json`, hourly) hits `app/api/cron/sync-active-games/route.ts`, which finds the `Week` with `activeSync = true` and re-syncs it — only one week should have `activeSync` on at a time.

**Admin surface**: `app/admin/**` + `app/api/admin/**` provide full CRUD over every model (seasons, weeks, games, teams, leagues, participations, wagers, users) plus weekly-processing endpoints (`process-games`, `default-bets`, `send-reminders`, `update-active-games`) that drive the weekly grading/settlement workflow. **Known gap**: admin API routes currently rely only on Clerk's middleware protecting `/admin` — they don't re-check `User.admin` per route. Any logged-in Clerk user can currently hit `/api/admin/**` directly. This should be fixed (check `User.admin` in each admin route) when touching that code, not treated as intentional.

**API route conventions**: Handlers are plain Next.js route handlers (`app/api/**/route.ts`), not a shared wrapper — each one repeats the auth → resolve internal user → validate body → Prisma call → `NextResponse` pattern (see `app/api/wagers/route.ts`). Errors are caught and returned as `new NextResponse(message, { status })`, not thrown. Wager `amount` must be a non-negative multiple of 10; `pick` is constrained to `'home' | 'visit'`.

**Email**: Resend (`RESEND_API_KEY`) is used for reminder emails; sends are logged in the `EmailReminder` model to avoid duplicate sends per user/week.

**Known repo quirks** (confirmed leftover cruft from earlier iterations, safe to consolidate/delete when touched — not intentional):
- Prisma client is defined in both `lib/db/prisma.ts` and `app/lib/db/prisma.ts`. Most `app/api/**` routes import the `app/lib/db/prisma` one.
- Both `next.config.js` and `next.config.ts`, and both `postcss.config.js` and `postcss.config.mjs` exist.
- `app/components/ui/use-toast.ts` and `use-toast.tsx` both exist.

## Deployment status

The app is **not currently in production** (offseason). It's being migrated from Vercel to self-hosted Docker; a GitHub Action for self-deploy is planned but not yet built. Don't assume `vercel.json`'s cron is live — once self-hosted, `sync-active-games` will need its own scheduling mechanism (e.g. a cron container or GitHub Action) instead.

## Project conventions (from `.cursorrules`)

- Functional components with hooks; `useState`/`useEffect` for local state.
- Tailwind utility classes + DaisyUI components — avoid inline styles, avoid non-Tailwind CSS.
- Prisma: use the generated model client methods, avoid raw queries.
- TypeScript: strict null checks enforced (`tsconfig.json` has `strict: true`); prefer `interface` over `type` for object shapes.
- Organize components by feature/route (see `app/admin/**` co-locating modals with their pages).
- Schema changes to `prisma/schema.prisma` should be called out explicitly before applying, since they require a migration.

## Environment variables

`DATABASE_URL`, `CFBD_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — see `.env.local`. The Docker build (`Dockerfile`) also expects these as build args.
