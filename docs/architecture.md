# Architecture

## Overview
This is a mobile-first, headless backend starter built on Next.js App Router, Clerk auth, and Prisma/Postgres.

Core principles:
- thin route handlers
- service-layer business/data logic
- canonical DB `User`
- stable JSON API contracts

## Modules

### Auth
- `src/lib/auth/auth-guard.ts`
- Bearer-token friendly request protection for `/api/v1/*`.
- Uses Clerk request auth and returns canonical DB user context.

### Users
- `src/modules/users/*`
- Manages canonical app user profile/preferences/onboarding.
- `/api/v1/me` reads and updates user-facing app state.

### Devices
- `src/modules/devices/*`
- Idempotent device registration by `pushToken`.
- `POST /api/v1/devices` upserts device metadata and heartbeat fields.

### Notifications
- `src/modules/notifications/*`
- Foundation-only in this phase: reads notification preferences from user preferences.
- No push delivery infrastructure yet.

### Subscriptions
- `src/modules/subscriptions/*`
- Resolves effective entitlements from subscription records.
- `/api/v1/me` includes normalized subscription state (`isPro`, `plan`, `status`).

## Data Model Highlights
- `User` is canonical application user.
- `Device` tracks client device tokens and metadata.
- `Subscription` stores source/status history; entitlements are derived in service layer.
