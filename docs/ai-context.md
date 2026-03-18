# AI Context

## Purpose
This repo is a reusable, opinionated, mobile-first backend starter for React Native apps.

## Current Foundation
- Auth: Clerk + bearer-token friendly `authGuard`
- Canonical app user: DB `User`
- App state: profile + preferences + onboarding via `/api/v1/me`
- Devices: idempotent token registration via `/api/v1/devices`
- Notifications: preference-read foundation only
- Subscriptions: entitlement resolution (`isPro`, `plan`, `status`) integrated into `/api/v1/me`

## Rules for Future Changes
- Keep route handlers thin; put logic in module services.
- Preserve shared API response shape.
- Use Zod for validation.
- Avoid product-specific domains unless explicitly requested.
- Update `CHANGELOG.md` for meaningful changes.
