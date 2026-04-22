# Middleware Authentication Flow

This document explains the authentication and authorization logic implemented in Next.js middleware.

## Overview

All authentication checks are now handled in **middleware** (not AuthGuard component), providing server-side protection before pages render.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  User requests page                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Middleware checks route type                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─── Stack Auth internal handler? (/handler/*)
                         │    → Bypass all checks, allow through
                         │
                         ├─── OAuth success page? (/oauth-success)
                         │    ├─── Has auth token?
                         │    │    → Redirect to home (already logged in)
                         │    └─── No token?
                         │         → Allow through (complete OAuth flow)
                         │
                         ├─── Has auth token?
                         │    ├─── No token + Protected route
                         │    │    → Redirect to /login
                         │    │
                         │    └─── Has token + Auth-only route (login/register)
                         │         → Redirect to home
                         │
                         └─── Public route or valid access
                              → Apply i18n middleware
                              → Render page
```

## Route Categories

### 1. **Public Routes** (No Auth Required)
Routes accessible without authentication:
- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Password reset
- `/onboarding/*` - Onboarding flow
- `/ext/*` - External/anonymous features
- `/stack-login` - OAuth login
- `/handler/*` - Stack Auth internal (bypasses ALL checks)
- `/oauth-success` - OAuth callback handler (special: AUTH_ONLY, no locale prefix)

### 2. **Auth-Only Routes** (Unauthenticated Users Only)
Routes that redirect authenticated users to home:
- `/login` - Email/password login
- `/register` - User registration
- `/forgot-password` - Password reset
- `/stack-login` - OAuth login (Google/GitHub)

**Why?** Logged-in users shouldn't see login/register pages.

### 3. **Protected Routes** (Authentication Required)
All other routes require authentication:
- `/brain-dump` - Task brain dump
- `/atomic-split/*` - Task decomposition
- `/master-kanban` - Kanban board
- Any route not in PUBLIC_ROUTES

## Implementation Details

### Check 1: Stack Auth Internal Handler Bypass
```typescript
if (pathname.startsWith("/handler")) {
  return NextResponse.next(); // Bypass all checks
}
```
**Why?** Stack Auth internal handler (`/handler/*`) must not have locale prefix or any middleware interference.

### Check 2: OAuth Success Auth Check (Special Case)
```typescript
if (pathname === "/oauth-success") {
  if (isAuthenticated) {
    return redirectToHome(req); // Already logged in, don't process OAuth again
  }
  return NextResponse.next(); // Allow OAuth flow to complete
}
```
**Why?** `/oauth-success` is an AUTH_ONLY route without locale prefix:
- If user already has `auth_token` → redirect to home (they're already logged in)
- If user doesn't have `auth_token` → allow access to complete OAuth flow

### Check 3: Authentication Status
```typescript
const token = req.cookies.get('auth_token')?.value;
const isAuthenticated = !!token;
```
**Why?** Cookie `auth_token` indicates backend authentication.

### Check 4: Unauthenticated User Protection
```typescript
if (!isAuthenticated && !isPublicRoute(pathname)) {
  return redirectToLogin(req); // → /en/login
}
```
**Why?** Protect all non-public routes from unauthenticated access.

### Check 5: Authenticated User Redirect (Localized Routes)
```typescript
if (isAuthenticated && isAuthOnlyRoute(pathname)) {
  return redirectToHome(req); // → /en/
}
```
**Why?** Logged-in users shouldn't access login/register pages with locale prefix (e.g., `/en/login`, `/en/stack-login`).

## Examples

### Example 1: Unauthenticated User
```
User → /en/brain-dump
  ├─ No auth_token cookie
  ├─ Not a public route
  └─ Redirect → /en/login ✅
```

### Example 2: Authenticated User Accessing Login
```
User → /en/login
  ├─ Has auth_token cookie
  ├─ Login is auth-only route
  └─ Redirect → /en/ (home) ✅
```

### Example 3: Authenticated User on Protected Route
```
User → /en/brain-dump
  ├─ Has auth_token cookie
  ├─ Not an auth-only route
  └─ Allow access ✅
```

### Example 4: Public Route
```
User → /ext-braindump?text=...
  ├─ No auth_token cookie
  ├─ /ext/* is public route
  └─ Allow access ✅
```

### Example 5: OAuth Callback (Internal Handler)
```
Google → /handler/oauth-callback?code=...
  ├─ Starts with /handler
  ├─ Bypass all checks
  └─ Allow Stack Auth to handle ✅
```

### Example 6: OAuth Success (Already Logged In)
```
User → /oauth-success
  ├─ Has auth_token cookie (already logged in)
  ├─ Is /oauth-success route
  └─ Redirect → /en/ (home) ✅
```

### Example 7: OAuth Success (New User)
```
User → /oauth-success (from Google OAuth)
  ├─ No auth_token cookie (new OAuth user)
  ├─ Is /oauth-success route
  └─ Allow access to complete OAuth flow ✅
```

## Configuration

### Middleware Matcher
Located in `/src/middleware.ts`:
```typescript
export const config = {
  matcher: [
    "/",                    // Root route
    "/oauth-success",       // Stack Auth OAuth callback (no locale)
    "/handler/:path*",      // Stack Auth internal handler (no locale)
    "/(en|cn|vn|kr)/:path*", // All localized routes
    "/((?!api|_next|_vercel|mp|.*\\..*).*)", // Catch-all except excluded
  ],
};
```

**Important:** Routes without locale prefix (`/oauth-success`, `/handler/*`) must be **explicitly listed** in the matcher. The catch-all pattern may not reliably match them.

### Auth-Only Routes
Located in `/src/middleware.ts`:
```typescript
const AUTH_ONLY_ROUTES = [
  "/login",
  "/forgot-password",
  "/register",
  "/stack-login",
  "/oauth-success"  // Special: No locale prefix, handled separately
];
```

**Note:** `/oauth-success` is handled separately from other AUTH_ONLY_ROUTES because:
- It has no locale prefix (accessed as `/oauth-success`, not `/en/oauth-success`)
- It needs to bypass i18n middleware
- It must be accessible for unauthenticated users completing OAuth flow
- But should redirect authenticated users to home (prevent re-processing)

### Public Routes
Located in `/src/middleware.ts`:
```typescript
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding",
  // ... more routes
  "/stack-login",
  "/handler",
  "/oauth-success",
];
```

**Note:** Auth-only routes are also public routes (accessible without auth), but have special redirect behavior when authenticated.

## Benefits

### ✅ Server-Side Protection
- Auth checks before page renders
- No flash of protected content
- Better security than client-side guards

### ✅ Improved UX
- Logged-in users can't accidentally visit login page
- Automatic redirect to home if they try
- Consistent behavior across all entry points

### ✅ Clean URLs
- Proper locale handling (`/en/`, `/cn/`)
- No client-side redirects (faster)
- SEO-friendly redirects

### ✅ Centralized Logic
- All auth logic in one place (middleware)
- Easy to maintain and update
- No need for AuthGuard components

## Testing

### Manual Test Cases

#### Test 1: Unauthenticated Access to Protected Route
1. Clear all cookies
2. Go to `/en/brain-dump`
3. Should redirect to `/en/login` ✅

#### Test 2: Authenticated Access to Login Page
1. Login normally
2. Go to `/en/login`
3. Should redirect to `/en/` (home) ✅

#### Test 3: OAuth Login Flow (New User)
1. Clear all cookies
2. Go to `/en/stack-login`
3. Click "Continue with Google"
4. After OAuth: should go through `/oauth-success` → home ✅

#### Test 3b: OAuth Success Page (Already Logged In)
1. Login normally (have `auth_token` cookie)
2. Manually go to `/oauth-success`
3. Should redirect to `/en/` (home) immediately ✅

#### Test 4: Public Route Access
1. Clear all cookies
2. Go to `/ext-braindump?text=test`
3. Should work without auth ✅

#### Test 5: Authenticated User on Protected Route
1. Login normally
2. Go to `/en/brain-dump`
3. Should access normally ✅

## Debugging

### Enable Logs
Middleware includes console logs:
```typescript
console.log('[Middleware] Authenticated user accessing auth-only route, redirecting to home');
```

### Check Cookies
In DevTools → Application → Cookies:
- `auth_token` - Backend auth token
- `stack-access` - Stack Auth token (OAuth)

### Common Issues

#### Issue: Infinite Redirect Loop
**Cause:** Home page (`/`) is in AUTH_ONLY_ROUTES
**Fix:** Remove `/` from AUTH_ONLY_ROUTES

#### Issue: Can Still Access Login When Authenticated
**Cause:** Cookie not being read correctly
**Fix:** Check cookie name matches `AuthCache.AUTH_TOKEN_CACHE`

#### Issue: OAuth Redirect Loop
**Cause:** Authenticated user keeps getting redirected when accessing `/oauth-success`
**Fix:** This is expected behavior - authenticated users shouldn't access `/oauth-success` again. The middleware correctly redirects them to home to prevent re-processing OAuth flow.

#### Issue: OAuth Success Not Working for New Users
**Cause:** Auth check blocking unauthenticated users from `/oauth-success`
**Fix:** The special check at line ~126-133 allows unauthenticated users to access `/oauth-success` to complete OAuth flow, while blocking authenticated users.

#### Issue: Middleware Not Running for /oauth-success
**Cause:** Route not matched by middleware `matcher` config
**Symptoms:** Page renders normally, middleware logic doesn't execute
**Fix:** Add `/oauth-success` explicitly to the `matcher` array:
```typescript
export const config = {
  matcher: [
    "/",
    "/oauth-success",  // Add this!
    "/handler/:path*",
    "/(en|cn|vn|kr)/:path*",
    "/((?!api|_next|_vercel|mp|.*\\..*).*)",
  ],
};
```
**Why:** Routes without locale prefix need explicit matcher entries. The catch-all pattern may not reliably match them.

## Migration from AuthGuard

### Before (Client-Side)
```tsx
// app/layout.tsx
<AuthGuard>
  {children}
</AuthGuard>
```
**Issues:**
- Client-side only
- Flash of protected content
- Can't prevent authenticated users from seeing login

### After (Server-Side)
```typescript
// middleware.ts
export default async function handler(req: NextRequest) {
  // Server-side auth checks
  // Redirects before rendering
}
```
**Benefits:**
- Server-side protection
- No flash of content
- Better UX for authenticated users

## Security Considerations

### ✅ Token Validation
- Middleware only checks token **existence**, not validity
- Backend must validate token on API calls
- Expired tokens handled by API interceptors

### ✅ Cookie Security
- `SameSite=Lax` prevents CSRF
- `HttpOnly` flag recommended for production
- Tokens expire after 24 hours

### ✅ Route Protection Layers
1. **Middleware** - First line of defense
2. **API Interceptors** - Validate token on requests
3. **Backend** - Final validation + authorization

### ⚠️ Limitations
- Middleware can't access localStorage (only cookies)
- Can't decrypt/validate JWT (use backend for that)
- Should not contain sensitive business logic
