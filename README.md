# nextstarter

A reusable Next.js starter with:
- next.js (app router)
- clerk auth (protected `/app/*`)
- neon postgres via vercel storage
- prisma (pinned v6) + migrations
- user table mapped to clerk user
- tailwind + shadcn-ready setup
- zod-based env validation
- modular service layer (`src/modules/*`)
- versioned app API routes (`/api/v1/*`)

## quickstart (new project)

### 1) create a new repo from this template (github)
click **use this template**.

### 2) install + link vercel
```bash
pnpm install
vercel link
```
If pnpm blocks postinstall scripts (Prisma), run `pnpm approve-builds` then `pnpm install` again.

### 3) create storage in vercel
vercel dashboard → project → storage:
- create neon postgres

### 4) clerk setup
create a Clerk application.

add env vars in vercel:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
```

pull env:
```bash
vercel env pull .env.local
cp .env.local .env
```

### 5) migrate
```bash
pnpm exec prisma migrate dev
```

### 6) run
```bash
pnpm dev
```

### 7) health checks
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## routes

- GET /api/health → liveness + database connectivity
- GET /api/v1/me → canonical authenticated user record (auto-provisions DB user if missing)
- POST /api/webhooks/clerk → clerk webhook endpoint (public route + signature verification)

## app api contract (`/api/v1/*`)

All application-facing JSON endpoints return:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```
or
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "string",
    "code": "STRING_CODE"
  }
}
```

## mobile auth behavior

- Protected API routes use a shared `authGuard` helper.
- Supports `Authorization: Bearer <token>` for React Native/mobile clients.
- Cookie-based auth also continues to work for web usage.
- `/api/v1/me` auto-provisions the DB user from Clerk if not already present.

## baseline rules

see `baseline.md`

## notes
- Next.js 16 uses proxy.ts (replaces middleware.ts).
- Webhook provisioning: `POST /api/webhooks/clerk`, env `CLERK_WEBHOOK_SECRET`, event `user.created`.

## environment validation
Env is validated with Zod in `src/env.ts`.
- Core vars are required at boot: Clerk + Postgres.
- Feature vars are validated when used:
  - `CLERK_WEBHOOK_SECRET` only for `/api/webhooks/clerk`
- Production build runs with `SKIP_ENV_VALIDATION=1` so CI/build can compile without secrets.
- Add new variables in `src/env.ts` and `.env.example`.

## prisma pooled vs direct connections
Use pooled URL for app runtime (`POSTGRES_PRISMA_URL`) and direct URL for migrations (`POSTGRES_URL_NON_POOLING`).

## clerk webhook user provisioning
`user.created` is handled by `POST /api/webhooks/clerk` to upsert the DB user.

## project structure (api/server)

```txt
src/
  app/api/
    health/route.ts
    v1/me/route.ts
    webhooks/clerk/route.ts
  lib/
    api/response.ts
    api/validation.ts
    auth/auth-guard.ts
    prisma.ts
  modules/
    users/users.service.ts
```
