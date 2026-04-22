# OAuth Authentication Flow

This document explains the optimized OAuth authentication flow using Stack Auth.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  User clicks "Continue with Google" at /en/stack-login         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stack Auth redirects to Google OAuth                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  User authorizes on Google                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Google redirects to /handler/oauth-callback                     │
│  - Stack Auth handles callback                                   │
│  - Exchanges code for token                                      │
│  - Stores token in cookie: "stack-access"                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stack Auth redirects to /oauth-success                          │
│  (configured via afterSignIn URL)                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  /oauth-success page:                                            │
│  1. useUser() detects Stack Auth user                           │
│  2. Sync user to stackAuthStore                                 │
│  3. Get pending braindump ID from sessionStorage                │
│  4. Call authStore.oauthLogin():                                │
│     - POST /auth/oauth-login to backend                         │
│     - Receive backend token                                     │
│     - Store token in:                                           │
│       * cookie: "auth_token"                                    │
│       * localStorage: via zustand persist                       │
│     - Store userInfo in authStore                               │
│  5. Clear pending braindump from sessionStorage                 │
│  6. Redirect to home: "/"                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  User lands on home page, fully authenticated                   │
│  - Stack Auth session active (stack-access cookie)              │
│  - Backend session active (auth_token cookie + localStorage)    │
│  - Braindump linked to user account (if existed)                │
└─────────────────────────────────────────────────────────────────┘
```

## Key Benefits

### ✅ Optimized Flow
- **No locale routing issues** - `/oauth-success` is at root level (no `/en/` prefix)
- **Single redirect** - Stack Auth → OAuth Success → Home (no intermediate pages)
- **Centralized logic** - All OAuth handling in one place

### ✅ State Management
- **Stack Auth state** - Handled by Stack Auth SDK (cookie: `stack-access`)
- **Backend auth state** - Handled by authStore (cookie: `auth_token`, localStorage)
- **Pending braindump** - Handled by sessionStorage (`pending_braindump_id`)

### ✅ Clean Separation
- `/en/stack-login` - Only renders OAuth buttons, no auth logic
- `/oauth-success` - Handles all post-OAuth processing
- `/handler/oauth-callback` - Stack Auth internal callback (no custom code)

## File Structure

```
src/
├── app/
│   ├── oauth-success/
│   │   ├── layout.tsx          # StackProvider wrapper
│   │   └── page.tsx            # OAuth success handler
│   ├── handler/
│   │   └── [...stack]/
│   │       └── page.tsx        # Stack Auth handler (default)
│   └── [locale]/
│       └── (stack-auth)/
│           └── stack-login/
│               └── page.tsx    # OAuth login UI (buttons only)
├── stack/
│   ├── client.ts               # Stack Auth client config
│   └── server.ts               # Stack Auth server config
├── stores/
│   ├── authStore.ts            # Backend auth state + oauthLogin()
│   └── stackAuthStore.ts       # Stack Auth user state
└── middleware.ts               # Route protection + i18n bypass
```

## Configuration

### Stack Auth URLs
```typescript
// src/stack/client.ts & src/stack/server.ts
urls: {
  handler: "/handler",
  afterSignIn: "/oauth-success",  // ← Redirect after OAuth success
}
```

### Middleware Bypass
```typescript
// src/middleware.ts
// Bypass i18n for Stack Auth routes
if (pathname.startsWith("/handler") || pathname.startsWith("/oauth-success")) {
  return NextResponse.next();
}
```

### Public Routes
```typescript
// src/middleware.ts
const PUBLIC_ROUTES = [
  // ...
  "/handler",
  "/oauth-success",  // ← No auth required
];
```

## Implementation Details

### 1. OAuth Success Handler
Located at `/src/app/oauth-success/page.tsx`:
- Detects Stack Auth user via `useUser()` hook
- Calls `authStore.oauthLogin()` to sync with backend
- Handles braindump linking via sessionStorage
- Redirects to home after completion

### 2. Auth Store OAuth Method
Located at `/src/stores/authStore.ts`:
```typescript
oauthLogin: async ({ data, onSuccess, onError }) => {
  // 1. Set loading state
  // 2. Call backend API: POST /auth/oauth-login
  // 3. Save token to cookie
  // 4. Save token to localStorage (via persist)
  // 5. Save userInfo to store
  // 6. Execute callbacks
}
```

### 3. Pending Braindump Utility
Located at `/src/utils/pendingBraindump.ts`:
```typescript
pendingBraindump.save(id)   // Save braindump ID before login
pendingBraindump.get()      // Retrieve during OAuth
pendingBraindump.clear()    // Clear after successful linking
```

## Testing

### Manual Test Flow
1. Clear all cookies and sessionStorage
2. Create braindump at `/ext-braindump?text=test`
3. Verify `pending_braindump_id` in sessionStorage
4. Go to `/en/stack-login`
5. Click "Continue with Google"
6. Authorize on Google
7. Should redirect to `/oauth-success` (loading screen)
8. Should auto-redirect to `/` (home)
9. Verify cookies: `stack-access` and `auth_token`
10. Verify braindump linked to user account

### Debug Points
- Check console logs for "OAuth Success - Stack Auth user:"
- Check console logs for "Pending braindump ID:"
- Check Network tab for POST `/auth/oauth-login`
- Check cookies in DevTools
- Check localStorage for `useAuthStore`

## Troubleshooting

### Issue: Still redirects to `/en/stack-login`
**Solution:** Clear browser cache and restart dev server

### Issue: 404 on `/oauth-success`
**Solution:** Verify middleware bypass is working

### Issue: User not syncing to backend
**Solution:** Check Network tab for API errors, verify backend endpoint

### Issue: Infinite loop
**Solution:** Check `hasProcessedRef` is working correctly

## Security Notes

- ✅ Stack Auth tokens stored in httpOnly cookies
- ✅ Backend tokens stored in cookies + localStorage
- ✅ CSRF protection via SameSite=Lax
- ✅ No sensitive data in client-side code
- ✅ Braindump linking only for anonymous braindumps
