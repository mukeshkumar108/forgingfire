# Frontend Integration (React Native)

## 1) Authenticate with Bearer Token

Use Clerk in the mobile app and send session token on API calls:

`Authorization: Bearer <session_token>`

Protected app endpoints rely on this header via `authGuard`.

## 2) Fetch Canonical User State

Call:

`GET /api/v1/me`

Use this as startup/bootstrap state for:
- profile
- preferences
- onboarding
- subscription entitlements

## 3) Update User App State

Call:

`PATCH /api/v1/me`

Send only sections you want to update (`profile`, `preferences`, `onboarding`).

## 4) Register Device Token

After obtaining a push token on device:

`POST /api/v1/devices`

with payload:

```json
{
  "platform": "ios",
  "pushToken": "<token>",
  "appVersion": "1.0.0"
}
```

This endpoint is idempotent by token and safe to call multiple times.

## 5) Typical App Flow

1. User signs in with Clerk.
2. App fetches `GET /api/v1/me`.
3. App registers token with `POST /api/v1/devices`.
4. App updates profile/preferences via `PATCH /api/v1/me` as needed.
