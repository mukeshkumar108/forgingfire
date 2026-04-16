# Mobile-Facing API Contract (Version 1.0)

This document outlines the current stable contract for the `forgingfire` backend that mobile/Ember frontends can rely on.

## 1. Authentication Expectations
The backend relies on [Clerk](https://clerk.com) for authentication.

- **Requirement:** Authenticated requests MUST include a Bearer token in the `Authorization` header.
- **Header:** `Authorization: Bearer <clerk_session_token>`
- **Validation:** The backend uses `getAuth()` from `@clerk/nextjs` to verify the token.
- **Errors:**
  - `401 INVALID_AUTH_HEADER`: Header is present but not a Bearer token.
  - `401 INVALID_BEARER_TOKEN`: Token is present but expired or invalid.
  - `401 UNAUTHORIZED`: No authorization provided.

## 2. Response Envelope Conventions
All app-facing endpoints (`/api/v1/*`) follow a consistent JSON envelope:

```json
{
  "success": boolean,
  "data": object | null,
  "error": {
    "message": "string",
    "code": "UPPERCASE_SNAKE_CASE_CODE"
  } | null
}
```

## 3. Provisioning Behavior
The backend uses a "just-in-time" provisioning model:
- When a new Clerk user makes their first request to any protected `/api/v1/*` endpoint, the `authGuard` automatically calls `ensureUserProvisioned`.
- This syncs the user's primary email, username, and profile image from Clerk to the local database.
- **Frontend Impact:** The first request from a new user might have slightly higher latency (~100-200ms) due to the Clerk API fetch and local database upsert.

---

## 4. Endpoints

### `GET /api/v1/me`
Fetches the canonical application user state, including profile, preferences, onboarding, and subscription status.

**Success Response `data`:**
```json
{
  "id": "cuid_string",
  "clerkUserId": "user_29w...",
  "email": "user@example.com",
  "profile": {
    "username": "handle",
    "displayName": "Full Name",
    "firstName": "First",
    "lastName": "Last",
    "bio": "string | null",
    "imageUrl": "https://...",
    "timezone": "America/New_York",
    "locale": "en-US"
  },
  "preferences": {
    "notifications": { "push": true, "email": true },
    "communications": { "marketing": false },
    "privacy": { "analytics": true }
  },
  "onboarding": {
    "completed": boolean,
    "completedAt": "ISO8601 string | null"
  },
  "subscription": {
    "isPro": boolean,
    "plan": "free | pro",
    "status": "active | trialing | none"
  },
  "createdAt": "ISO8601 string",
  "updatedAt": "ISO8601 string"
}
```

### `PATCH /api/v1/me`
Updates specific sections of the user's application state.

**Request Payload:**
Send only the sections you wish to update.
```json
{
  "profile": {
    "username": "new_handle",
    "displayName": "New Name",
    "bio": "New bio",
    "timezone": "UTC",
    "locale": "fr-FR"
  },
  "preferences": {
    "notifications": { "push": false }
  },
  "onboarding": {
    "completed": true
  }
}
```
- **Note on `onboarding`:** Setting `completed: true` is one-way. The backend will record the current timestamp as `completedAt` if it wasn't already set.

### `POST /api/v1/devices`
Registers or updates a push token for the current user.

**Request Payload:**
```json
{
  "platform": "ios | android | web",
  "pushToken": "string",
  "appVersion": "1.0.0 (optional)"
}
```
- **Behavior:** This endpoint is idempotent. If the `pushToken` already exists, it updates the `userId` and `lastSeenAt` timestamp.

---

## 5. Known Assumptions & Deferred Areas
- **Subscriptions:** The `subscription` data is derived from a local `Subscription` table. In the current implementation, this table must be updated manually or via a separate process (the webhook handlers are not yet implemented).
- **Timezones/Locales:** The backend validates these using standard `Intl` values. Passing an invalid timezone or locale will result in a `400` error.
- **Username Uniqueness:** If a user tries to change their `username` to one already taken by another user, the API returns `409 USERNAME_TAKEN`.

## 6. Stability Assessment
| Component | Status | Recommendation |
| :--- | :--- | :--- |
| **Auth/Envelope** | Stable | Safe for frontend core. |
| **Profile/Prefs** | Stable | Safe for frontend state management. |
| **Device Reg** | Stable | Safe to call on app startup. |
| **Subscriptions** | Beta | Entitlement logic is solid, but sync logic (webhooks) is missing. |
| **Push Delivery** | Deferred | Token storage exists, but no delivery infrastructure is implemented. |
