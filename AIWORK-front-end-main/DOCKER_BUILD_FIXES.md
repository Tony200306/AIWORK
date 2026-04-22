# Docker Build Fixes

This document explains fixes applied to resolve Docker build issues.

## Issue: Prerender Error on OAuth Success Page

### Error Message
```
Export encountered an error on /oauth-success/page: /oauth-success
Error occurred prerendering page "/oauth-success"
```

### Root Cause
Next.js was attempting to **statically generate** (prerender) the `/oauth-success` page during build time. However, this page uses:
- `useUser()` hook from Stack Auth - requires runtime context
- OAuth callback data from query params - only available at runtime
- Client-side state management - cannot be prerendered

**Why it fails:**
```typescript
// oauth-success/page.tsx
"use client";
const user = useUser(); // ❌ Cannot call hooks during static generation
```

Static Site Generation (SSG) tries to render pages at build time without:
- Browser context
- Runtime data
- User session
- OAuth tokens

### Solution: Force Dynamic Rendering

Added `dynamic = 'force-dynamic'` export to force runtime rendering:

```typescript
// Force dynamic rendering - cannot be statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

This tells Next.js:
- ✅ Don't prerender this page at build time
- ✅ Render on every request at runtime
- ✅ Don't cache (revalidate = 0)

**⚠️ Important:** Route segment config exports (`dynamic`, `revalidate`) can only be used in **Server Components**. If your page is a Client Component (`"use client"`), these exports must be placed in the **layout.tsx** instead.

## Files Updated

### 1. `/src/app/oauth-success/page.tsx`
```typescript
"use client"; // Client Component - cannot export route config here

export default function OAuthSuccessPage() {
  const user = useUser(); // ✅ Now works at runtime
  // ...
}
```

**Note:** Since this is a Client Component, the route config exports are in the layout.tsx instead.

### 2. `/src/app/oauth-success/layout.tsx`
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OAuthSuccessLayout({ children }) {
  return <StackProvider>{children}</StackProvider>;
}
```

### 3. `/src/app/handler/[...stack]/page.tsx`
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Handler(props: any) {
  return <StackHandler app={stackServerApp} {...props} />;
}
```

### 4. `/src/app/handler/layout.tsx`
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HandlerLayout({ children }) {
  return <StackProvider>{children}</StackProvider>;
}
```

### 5. `/src/app/oauth-success/loading.tsx` (NEW)
```typescript
export default function OAuthSuccessLoading() {
  return <Loading />; // Provides Suspense boundary for useUser()
}
```

**Why needed:** Stack Auth's `useUser()` hook requires a Suspense boundary. Next.js provides this automatically when a `loading.tsx` file exists.

## Why These Pages Need Dynamic Rendering

### OAuth Success Page (`/oauth-success`)
- **Runtime dependencies:**
  - Stack Auth user session
  - OAuth callback query params (`?code=...&state=...`)
  - Cookie data (`stack-access`, `auth_token`)
  - sessionStorage (`pending_braindump_id`)
- **Cannot prerender because:**
  - Different for every user
  - Requires active OAuth session
  - Depends on callback data

### Handler Page (`/handler/*`)
- **Runtime dependencies:**
  - OAuth callback parameters
  - Stack Auth internal state
  - Dynamic routing (`[...stack]`)
- **Cannot prerender because:**
  - Handles OAuth flows dynamically
  - Multiple routes under single handler
  - Requires Stack Auth context

## Build Time vs Runtime

### Static Generation (SSG) - Build Time
```
Docker build → Next.js tries to render page → ❌ Fails (no runtime context)
```

### Dynamic Rendering (SSR) - Runtime
```
User request → Next.js renders page with context → ✅ Success
```

## Impact on Performance

### Before (Failed Static Generation)
- ❌ Build fails
- ❌ Cannot deploy

### After (Dynamic Rendering)
- ✅ Build succeeds
- ✅ Pages render on-demand at runtime
- ⚠️ Slightly slower first load (acceptable for OAuth callbacks)
- ✅ Always up-to-date with user session

**Note:** Performance impact is minimal for OAuth pages since:
- They're only accessed during login flow
- Redirect quickly to home
- Not user-facing landing pages

## Testing the Fix

### Local Build Test
```bash
npm run build
# Should complete without errors
```

### Docker Build Test
```bash
docker-compose up --build
# Should build successfully
```

### Runtime Test
1. Run Docker container
2. Go to `/en/stack-login`
3. Click "Continue with Google"
4. Should successfully redirect through `/oauth-success`

## Other Pages That May Need This

Consider adding `dynamic = 'force-dynamic'` to pages that:
- Use authentication hooks (`useUser`, `useSession`)
- Read query parameters dynamically
- Access cookies/localStorage at page level
- Depend on runtime context

Examples:
- `/stack-login` - May need if it accesses user state
- Any page using `useUser()` hook
- Pages with `useSearchParams()` that must be dynamic

## Prevention

### When Creating New Pages

**If your page uses any of these, add `dynamic = 'force-dynamic'`:**
```typescript
// ✅ Safe patterns (can be static)
- Static content
- Server-side data fetching
- getStaticProps data

// ⚠️ Requires dynamic (add export const dynamic)
- useUser() hook
- useSearchParams() with required params
- Cookie/localStorage access
- OAuth callbacks
- User session state
```

### Example Template
```typescript
"use client";

// Force dynamic if needed
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function MyPage() {
  const user = useUser(); // Requires dynamic
  // ...
}
```

## Related Documentation

- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
- [Prerender Error](https://nextjs.org/docs/messages/prerender-error)

## Troubleshooting

### Build still fails with different error
- Check environment variables are set in Docker build
- Verify all Stack Auth env vars are passed as build args
- Check for other pages using runtime-only hooks

### Page renders blank after fix
- Verify StackProvider is wrapping the page
- Check browser console for errors
- Ensure Stack Auth env vars are valid

### Infinite loading on OAuth callback
- Check middleware isn't blocking the route
- Verify `/oauth-success` is in PUBLIC_ROUTES
- Check Stack Auth `afterSignIn` URL is correct

### Invalid revalidate value error
```
Invalid revalidate value "function() { ... }" on "/oauth-success"
Attempted to call revalidate() from the server but revalidate is on the client
```
**Cause:** Route segment config exports (`dynamic`, `revalidate`) in a Client Component
**Fix:** Move exports to layout.tsx (Server Component)
```typescript
// ❌ WRONG - page.tsx is "use client"
"use client";
export const dynamic = 'force-dynamic';
export default function Page() { ... }

// ✅ CORRECT - layout.tsx (no "use client")
export const dynamic = 'force-dynamic';
export default function Layout({ children }) { ... }
```

### Missing Suspense boundary error
```
Suspense boundary not found!
This code path attempted to display a loading indicator, but didn't find a Suspense boundary
```
**Cause:** Stack Auth's `useUser()` hook requires a Suspense boundary but none exists
**Fix:** Create a `loading.tsx` file in the same directory
```typescript
// src/app/oauth-success/loading.tsx
export default function OAuthSuccessLoading() {
  return <Loading />;
}
```
**Why:** Next.js automatically wraps routes with Suspense when a `loading.tsx` file exists
