# CHANGELOG

Concise engineering changelog for this starter.

## Phase 4A — Devices and Notifications Foundation (2026-03-18)
### Summary
- Added device registration foundation for mobile clients.
- Added lightweight notifications foundation without delivery infrastructure.

### Key Changes
- Added `Device` model with:
  - relation to `User`
  - `platform` enum (`ios | android | web`)
  - unique `pushToken`
  - optional `appVersion`
  - `lastSeenAt`, `createdAt`, `updatedAt`
  - index on `userId`
- Added migration for `Device` schema.
- Added `src/modules/devices/devices.service.ts`:
  - idempotent registration via `pushToken` upsert
  - dedupe/avoid duplicate records
  - metadata and `lastSeenAt` updates on re-registration
- Added `POST /api/v1/devices`:
  - authenticated via `authGuard`
  - Zod-validated payload
  - shared API success/error contract
  - standardized failure code `DEVICE_REGISTRATION_FAILED`
- Added `src/modules/notifications/notifications.service.ts`:
  - `getUserNotificationPreferences(userId)` reads from existing `User.preferences`
  - no push sending, queues, or worker infra

### Decisions Locked In
- Device registration is idempotent and token-deduplicated.
- Notifications foundation is read-only preference access at this phase.
- No push delivery infrastructure, queueing, or subscription concerns in Phase 4A.
- Device ownership is last-write-wins by pushToken; tokens are reassigned on login.

## Phase 3.5 — Decision Hardening and Contract Tightening (2026-03-18)
### Summary
- Hardened username/profile/preferences/onboarding behavior already introduced in Phase 3.
- Locked down validation and normalization semantics to reduce ambiguity for mobile clients.

### Key Changes
- Username contract tightened:
  - lowercase canonical form, trimmed, `[a-z0-9._]`, length `3..32`
  - normalization applied in validation and service layer
  - backfill migration added to normalize existing usernames
- Profile contract tightened:
  - empty strings normalized to `null` for nullable fields
  - stricter lengths and URL validation
  - locale canonicalization and validation
  - timezone validation (runtime-supported list when available)
- Preferences contract tightened:
  - strict object schemas (unknown keys rejected)
  - stable default shape preserved
  - partial updates merge into canonical shape
- Onboarding semantics tightened:
  - one-way completion in PATCH contract (`completed: true` only)
  - `completedAt` set once on completion and not cleared by API
- Provisioning behavior tightened:
  - webhook/seed writes are fallback-only for existing users (no overwrite of app-managed values)

### Decisions Locked In
- Predictable, strict mobile-facing contracts over permissive input handling.
- DB `User` remains canonical app user; Clerk remains auth identity source.

## Phase 3 — Profile, Preferences, and Onboarding Foundation (2026-03-18)
### Summary
- Expanded canonical `User` model for app-level profile/preferences/onboarding.
- Extended `/api/v1/me` and added authenticated `PATCH /api/v1/me`.

### Key Changes
- Added profile fields: `username`, `displayName`, `firstName`, `lastName`, `bio`, `imageUrl`, `timezone`, `locale`.
- Added `preferences` JSON and onboarding fields (`onboardingCompleted`, `onboardingCompletedAt`).
- Added Zod schemas for preferences/update payload.
- Added service-level update logic and DTO mapping.
- Updated webhook seeding to include additional identity/profile fields.

### Decisions Locked In
- Keep profile/preferences/onboarding directly on `User` for simplicity.
- Keep update scope minimal: self-user partial updates via `/api/v1/me`.

## Phase 2 — Modular Baseline and API Contract Foundation (2026-03-18)
### Summary
- Established modular API/service baseline and mobile-first auth boundary.

### Key Changes
- Added versioned app endpoint: `GET /api/v1/me`.
- Added `GET /api/health` for liveness + DB connectivity check.
- Added shared API response helpers and validation helpers.
- Added reusable auth guard with explicit bearer-token support.
- Introduced `src/modules/users/users.service.ts`; removed demo `blob-test` endpoint.
- Added Prisma index for `User.email`.

### Decisions Locked In
- `/api/v1/*` is app-facing contract surface.
- Route handlers remain thin; service layer contains business/data logic.
- Webhook route remains outside versioned app surface.

## Phase 1 — Repair and Stabilization (2026-03-18)
### Summary
- Repaired scaffold breakages and made baseline health deterministic.

### Key Changes
- Fixed dependency correctness (`zod` missing).
- Updated Clerk usage for current package behavior (async auth + request typing fixes).
- Ensured Clerk webhook route accessibility through proxy/public-route config.
- Hardened Prisma generation reliability (`postinstall` + build generate path).
- Added env sanity with Zod and build-time env validation skip mode.
- Added `.env.example` and aligned setup docs.

### Decisions Locked In
- Prioritize reproducible baseline health: install, lint, typecheck, build all green.
- Keep webhook signature verification mandatory and route publicly reachable.
