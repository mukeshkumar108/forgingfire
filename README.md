# forgingfire

Mobile-first, headless backend starter for consumer React Native apps.
This provides a ready-to-use backend with authentication, user system, device tracking, and subscriptions designed to plug directly into a React Native app.

## Quickstart

1. Create a new repo from this template
- Click **Use this template** on GitHub.

2. Install dependencies and link Vercel
```bash
pnpm install
vercel link
```
If Prisma scripts are blocked:
```bash
pnpm approve-builds
pnpm install
```

3. Create database (Neon via Vercel)
- Vercel dashboard -> your project -> Storage
- Create **Neon Postgres**
- Vercel will automatically inject the required database environment variables:
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`

4. Set up Clerk (Auth)
- Go to https://clerk.com and create an application.
- Add these env vars in Vercel:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```
- These environment variables will be pulled into your local `.env` via `vercel env pull`.

5. Pull environment variables
```bash
vercel env pull .env.local
cp .env.local .env
```

6. Run migrations
```bash
pnpm exec prisma migrate dev
```

7. Start dev server
```bash
pnpm dev
```

8. Smoke test
- Open `/api/health`
- Call `/api/v1/me` using a Clerk session token in:
  - `Authorization: Bearer <token>`
- Register a device via `POST /api/v1/devices`

## Important
- Clerk handles authentication.
- Postgres is required.
- This is a backend-first/headless starter (not a full web UI product).

## What This Is
- Next.js App Router backend
- Clerk auth with bearer-token-friendly API protection
- Prisma + Postgres data layer
- Versioned app endpoints under `/api/v1/*`
- Canonical app user (`/api/v1/me`) with profile/preferences/onboarding/subscription state
- Device registration endpoint (`/api/v1/devices`)

## Required Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

Optional:
- `CLERK_WEBHOOK_SECRET` (required only for `/api/webhooks/clerk`)

## Health Checks
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Docs
- [Architecture](docs/architecture.md)
- [API Contract](docs/api-contract.md)
- [Frontend Integration](docs/frontend-integration.md)
- [AI Context](docs/ai-context.md)
- [Changelog](CHANGELOG.md)
- [Agent Rules](AGENTS.md)
