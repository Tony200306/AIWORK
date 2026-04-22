# OAuth Backend API Specification

## Required Endpoint

Backend cần tạo endpoint mới để xử lý OAuth login/register:

### `POST /auth/oauth-login`

**Purpose:** Handle OAuth authentication - auto-register if user doesn't exist, login if exists

**Request Body:**
```json
{
  "email": "user@example.com",
  "provider": "google",  // or "github"
  "provider_id": "7e1e4852-db80-4fba-96b5-48370ef3315f",  // Stack Auth user ID
  "name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",  // optional
  "braindump_id": "braindump-uuid-here"  // optional - link existing braindump to user
}
```

**Response (Success - 200):**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": "backend-user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "password": "",  // empty for OAuth users
      "created_at": "2024-01-26T00:00:00Z",
      "updated_at": "2024-01-26T00:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error - 400/500):**
```json
{
  "status": 400,
  "message": "Invalid request",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Backend Logic

1. **Check if user exists** by email
2. **If user exists:**
   - Generate access token
   - If `braindump_id` provided: link braindump to user
   - Return user + token
3. **If user doesn't exist:**
   - Create new user with:
     - `email` from OAuth
     - `name` from OAuth
     - `password` = empty/null (OAuth users don't need password)
     - `role` = "user" (default)
     - Store `provider` and `provider_id` (optional, for tracking)
   - If `braindump_id` provided: link braindump to user
   - Generate access token
   - Return user + token

### Braindump Linking Logic

When `braindump_id` is provided in the request:

1. Find braindump by ID
2. Update braindump: `user_id` = authenticated user's ID
3. This links the anonymous braindump to the user's account
4. User can now see this braindump in their authenticated dashboard

**SQL Example:**
```sql
UPDATE braindumps
SET user_id = :user_id, updated_at = NOW()
WHERE id = :braindump_id AND user_id IS NULL;
-- Only update if braindump is not already linked to another user
```

## Database Schema (Optional)

Consider adding fields to User table:

```sql
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN oauth_provider_id VARCHAR(255);
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;  -- Allow null for OAuth users
```

## Security Notes

- Token should expire (suggest 24 hours)
- Validate email format
- Store `provider_id` to prevent duplicate OAuth accounts
- Consider adding index on `(oauth_provider, oauth_provider_id)` for faster lookup

## Frontend Integration

Frontend will call this endpoint after successful OAuth login with Stack Auth.
See `/src/services/Auth/oauthLogin.ts` for implementation.
