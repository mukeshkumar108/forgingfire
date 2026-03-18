# nextstarter

A reusable Next.js starter with:
- next.js (app router)
- clerk auth (protected `/app/*`)
- neon postgres via vercel storage
- prisma (pinned v6) + migrations
- user table mapped to clerk user
- vercel blob storage (with test route)
- tailwind + shadcn-ready setup
- zod-based env validation

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
- create blob

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

If you plan to use blob uploads, also set:
```
BLOB_READ_WRITE_TOKEN
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

- /app/settings → proves clerk + db mapping
- POST /api/blob-test → uploads a test blob (auth required)
- POST /api/webhooks/clerk → clerk webhook endpoint (public route + signature verification)

## baseline rules

see `baseline.md`

## notes
- Next.js 16 uses proxy.ts (replaces middleware.ts).
- Webhook provisioning: `POST /api/webhooks/clerk`, env `CLERK_WEBHOOK_SECRET`, event `user.created`.

## environment validation
Env is validated with Zod in `src/env.ts`.
- Core vars are required at boot: Clerk + Postgres.
- Feature vars are validated when used:
  - `BLOB_READ_WRITE_TOKEN` only for `/api/blob-test`
  - `CLERK_WEBHOOK_SECRET` only for `/api/webhooks/clerk`
- Production build runs with `SKIP_ENV_VALIDATION=1` so CI/build can compile without secrets.
- Add new variables in `src/env.ts` and `.env.example`.

## prisma pooled vs direct connections
Use pooled URL for app runtime (`POSTGRES_PRISMA_URL`) and direct URL for migrations (`POSTGRES_URL_NON_POOLING`).

## clerk webhook user provisioning
`user.created` is handled by `POST /api/webhooks/clerk` to upsert the DB user.
