# API Contract

All app-facing endpoints return:

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

## `GET /api/v1/me`

Returns canonical app user surface plus derived subscription entitlements.

Example success:

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "clerkUserId": "clerk_123",
    "email": "test@example.com",
    "profile": {
      "username": "alice",
      "displayName": "Alice",
      "firstName": "Alice",
      "lastName": "Doe",
      "bio": null,
      "imageUrl": null,
      "timezone": "Europe/London",
      "locale": "en-GB"
    },
    "preferences": {
      "notifications": { "push": true, "email": true },
      "communications": { "marketing": false },
      "privacy": { "analytics": true }
    },
    "onboarding": {
      "completed": false,
      "completedAt": null
    },
    "subscription": {
      "isPro": false,
      "plan": "free",
      "status": "none"
    },
    "createdAt": "2026-03-18T00:00:00.000Z",
    "updatedAt": "2026-03-18T00:00:00.000Z"
  },
  "error": null
}
```

## `POST /api/v1/devices`

Registers or updates a device by `pushToken`.

Request:

```json
{
  "platform": "ios",
  "pushToken": "expo_push_token",
  "appVersion": "1.0.0"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "dev_123",
    "userId": "user_123",
    "platform": "ios",
    "pushToken": "expo_push_token",
    "appVersion": "1.0.0",
    "lastSeenAt": "2026-03-18T00:00:00.000Z",
    "createdAt": "2026-03-18T00:00:00.000Z",
    "updatedAt": "2026-03-18T00:00:00.000Z"
  },
  "error": null
}
```
