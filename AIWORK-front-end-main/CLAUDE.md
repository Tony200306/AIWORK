# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vantum is a Next.js 16 App Router application with internationalization (i18n), featuring an AI-powered task decomposition system called "Atomic Split". The app helps users brain dump tasks, then uses AI to break them down into manageable steps with an intuitive kanban-style interface.

## Common Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production (standalone mode)
npm start            # Start production server
npm run lint         # Run ESLint
```

### Docker
```bash
docker-compose up --build    # Build and run with Docker
docker-compose down          # Stop containers
```

**Required Environment Variables:**

Core Configuration:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - Default language (en, cn, vn, kr)
- `NEXT_PUBLIC_FILE_RESOURCE_URL` - File upload service URL
- `NEXT_HOST_URL` - Frontend host URL
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - Analytics token

Braindump & AI Services:
- `NEXT_PUBLIC_AI_SERVICE_URL` - Braindump service URL
- `NEXT_PUBLIC_AI_SERVICE_API_KEY` - Braindump API key
- `NEXT_PUBLIC_AI_SERVICE_URL` - AI service endpoint
- `NEXT_PUBLIC_AI_SERVICE_API_KEY` - AI service API key

Stack Auth (OAuth):
- `NEXT_PUBLIC_STACK_PROJECT_ID` - Stack Auth project ID
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth public key
- `STACK_SECRET_SERVER_KEY` - Stack Auth secret key (server-side only)

Third-party Services:
- `DEEPGRAM_API_KEY` - Voice transcription API key

**Setup:**
1. Copy `.env.example` to `.env` and fill in values
2. Run `docker-compose up --build`
3. Access app at http://localhost:3000

## Architecture Overview

### App Structure

**Next.js App Router** with internationalized routing:
```
/src/app
├── [locale]/              # i18n parameter (en, cn)
│   ├── (onboarding-layout)/    # Grouped route - onboarding flow
│   │   └── onboarding/
│   │       ├── capacity-logical/
│   │       ├── capacity-feeling/
│   │       └── [6 more steps...]
│   └── (golden-path-layout)/   # Grouped route - main features
│       ├── atomic-split/[id]/  # Task decomposition UI
│       ├── master-kanban/
│       ├── brain-dump/
│       └── fte-kanban/
└── api/                   # Server routes (e.g., /api/transcribe)
```

**Key routes** defined in `/src/constants/RouteConfig.ts`:
- `/login`, `/forgot-password` - Public routes
- `/onboarding/*` - Multi-step onboarding flow with Mixpanel tracking
- `/brain-dump` - AI-powered task collection
- `/atomic-split/[id]` - Main feature: task decomposition with editable steps

### Internationalization (i18n)

- Uses `next-intl` with locale-based routing (`/en/*` or `/cn/*`)
- Configuration: `/src/i18n/config.ts` and `/src/i18n/routing.ts`
- Translation files: `/messages/en.json` and `/messages/cn.json`
- Hook: `useTranslations()` from next-intl

### State Management

**Zustand Store** (`/src/stores/authStore.ts`):
- Single store handles all authentication state
- Uses `persist` middleware with localStorage
- Stores: `token`, `userInfo`, modal states
- Important: `_hasHydrated` flag prevents hydration mismatches
- Methods: `login()`, `logout()`, `signup()`, password reset flows

**TanStack Query** for server state:
- Query hooks in `/src/hooks/shared/`
- Consistent pattern: `useGetTasksListByBraindump()`, `useCreateStep()`, etc.
- Smart polling: polls every 5s while AI is processing tasks

### API Service Layer

**Pattern**: Domain-organized service functions with typed responses

Example structure:
```typescript
export const login = async (data: Login) => {
  const response = await fetchApi.request<ResponseDetailSuccess<LoginResponseData> | ResponseFailure>({
    url: '/auth/login',
    method: 'POST',
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data;
};
```

**FetchAPI Client** (`/src/shared/Utilities/fetchApi/`):
- Custom Axios wrapper with request/response interceptors
- Auto-adds Authorization header with Bearer token
- Auto-refreshes token on 403 responses
- Auto-logout on 401 responses
- Supports request cancellation with AbortController

**Response Types** (`/src/services/_shared/types/ServiceResponse.ts`):
- `ResponseListSuccess<T>` - Paginated list responses
- `ResponseDetailSuccess<T>` - Single resource responses
- `ResponseFailure` - Error responses with status code and error array

**Service Organization**:
```
/src/services/
├── Auth/                  # login, signup, password reset, OTP
├── braindump/            # getBrainDump, createBrainDump
├── task/                 # getTasks, createStep, updateStep, etc.
├── user/
├── onboarding-question/
└── _shared/              # Common types, constants, utils
```

### Authentication Flow

**AuthGuard** (`/src/components/AuthGuard.tsx`):
- Protects routes, redirects to `/login` if not authenticated
- Waits for Zustand hydration before checking auth state
- Public routes bypass guard: `/login`, `/register`, `/forgot-password`

**Token Management**:
- Access token stored in Zustand + localStorage + cookie
- Auto-refresh on 403 via FetchAPI interceptor
- Cookie format: `auth_token={accessToken}; path=/; max-age=86400`

**Authentication Methods**:
1. Login: email + password
2. Signup: email + password + name (auto-login after)
3. Password Reset: requestResetPassword → validateOTP → resetPassword
4. Change Password: for logged-in users

### Component Patterns

**UI Components** (`/src/components/ui/`):
- Radix UI primitives wrapped with Tailwind styling (Shadcn/ui pattern)
- Use `class-variance-authority` for variant management
- All components use `cn()` utility (clsx + tailwind-merge)

**Forms** (`/src/components/ui/form.tsx` + `/src/components/ui/field.tsx`):
- Integrates `react-hook-form` with Zod validation
- Two patterns available:
  - `Form` + `FormField` (react-hook-form context)
  - `Field` + semantic fieldsets with data-slots
- Custom async validation helper: `zodAlwaysRefine()` in `/src/utils/zodAlwaysRefine.ts`

**Validation Patterns**:
- Email: `/src/utils/regexes/isEmail.ts`
- Phone: `/src/utils/regexes/isPhone.ts`
- Strong password: `/src/utils/regexes/isStrongPassword.ts`

### Unique Features

#### Atomic-Split Pattern

The core feature combining AI task decomposition with editable steps:

1. **Brain Dump** → User records tasks (text or voice via Deepgram)
2. **AI Processing** → Backend AI decomposes into subtasks (Steps)
3. **Atomic Split View** (`/atomic-split/[id]`):
   - Left: Task list with filtering/status
   - Right: Step breakdown for selected task
   - Drag-and-drop reordering with `@dnd-kit`

**Data Flow**:
```typescript
// Smart polling - only polls while AI is processing
const { data } = useGetTasksListByBraindump({ brainDumpId: params.id });

refetchInterval: (data) => {
  const isNotCompleted = data?.data?.status !== "COMPLETED";
  return isNotCompleted && hasNoTasks ? 5000 : false;
}
```

**Components**: `/src/app/[locale]/(golden-path-layout)/atomic-split/components/`

#### Onboarding Flow

Multi-step onboarding with shared context for validation:

- **Context-based validation**: Each page sets its validation function in `OnboardingProvider`
- **Mixpanel tracking**: `useStepTracking()` hook tracks step completion
- **Sequential navigation**: Previous/Next buttons, progress bar

**Pattern**:
```typescript
// In each onboarding page
const { setHandleNext } = useOnboardingContext();

useEffect(() => {
  const isValid = checkValidation();
  if (!isValid) {
    setHandleNext(null);
    return;
  }

  const handler = async () => {
    await trackStepCompletion(stepName, stepNumber, data);
  };
  setHandleNext(() => handler);
}, [dependencies]);
```

### Analytics - Mixpanel

**Setup** (`/src/lib/mixpanel.ts`):
- Proxied through Next.js rewrites: `/mp/*` → `https://api.mixpanel.com/*`
- Auto-tracks page views
- Persists to localStorage

**Usage**:
```typescript
import { track } from '@/lib/mixpanel';

track("Event Name", {
  property1: value1,
  timestamp: new Date().toISOString()
});
```

**Hooks**: `useStepTracking()` for onboarding step tracking

### Key Dependencies

- **Framework**: Next.js 16.0.1, React 19.2.0, TypeScript 5
- **State**: zustand 5.0.8, @tanstack/react-query 4.42.0
- **API**: axios 1.13.2 (wrapped in custom FetchAPI)
- **UI**: @radix-ui/*, lucide-react
- **Forms**: react-hook-form 7.66.1, zod 3.23.8
- **i18n**: next-intl 4.5.5
- **Styling**: tailwindcss 4, class-variance-authority
- **DnD**: @dnd-kit/* (core, sortable, utilities)
- **Analytics**: mixpanel-browser 2.73.0
- **Notifications**: sonner 2.0.7
- **Dates**: dayjs 1.11.19
- **Utils**: ramda 0.32.0, uuid 13.0.0

## Important Configuration Notes

### TypeScript Configuration

The project uses **loose TypeScript settings**:
- `strict: false` in tsconfig.json
- Many strict checks disabled (noImplicitAny, strictNullChecks, etc.)
- Build ignores TypeScript errors (`ignoreBuildErrors: true`)

**Implication**: When adding new code, maintain consistency but prefer type safety where possible.

### Path Aliases

Both `@/*` and `~/*` map to `/src/`:
```typescript
import { cn } from '@/lib/utils';
import { useAuthStore } from '~/stores/authStore';
```

### Next.js Configuration

- **Output**: `standalone` mode (can run without node_modules)
- **React Strict Mode**: Disabled
- **Build**: Ignores TypeScript and ESLint errors
- **Rewrites**: Proxies `/mp/*` to Mixpanel API

## Development Workflow

### Adding a New API Service

1. Create service function in `/src/services/{domain}/`
2. Define types in the same file or in `/src/models/`
3. Create query/mutation hook in `/src/hooks/shared/`
4. Use hook in components

Example:
```typescript
// 1. Service function
export const getMyData = async () => {
  const response = await fetchApi.request<ResponseDetailSuccess<MyData>>({
    url: '/my-endpoint',
    method: 'GET',
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data;
};

// 2. Hook
export const useGetMyData = () => {
  return useQuery<ResponseDetailSuccess<MyData>>({
    queryKey: ["my-data"],
    queryFn: getMyData,
  });
};
```

### Adding a New UI Component

1. Create component in `/src/components/ui/`
2. Use Radix UI primitives when available
3. Apply Tailwind classes with `cn()` utility
4. Use `class-variance-authority` for variants

### Adding a New Route

1. Create page in `/src/app/[locale]/(...)/`
2. Add route constant to `/src/constants/RouteConfig.ts`
3. Add translations to `/messages/{locale}.json`
4. Update AuthGuard if route should be public

### Adding Analytics Tracking

```typescript
import { track } from '@/lib/mixpanel';

const handleAction = () => {
  track("Action Name", {
    property1: value1,
    user_id: userInfo.id,
    timestamp: new Date().toISOString(),
  });
};
```

## Environment Variables

Required variables (set in `.env.local` for development, `.env` for Docker):

```bash
# Core Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_FILE_RESOURCE_URL=https://thk-api.vfmtech.vn
NEXT_HOST_URL=http://localhost:3000
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Braindump & AI Services
NEXT_PUBLIC_AI_SERVICE_URL=https://vantum-ai-prod.yitec.dev
NEXT_PUBLIC_AI_SERVICE_API_KEY=your_braindump_api_key
NEXT_PUBLIC_AI_SERVICE_URL=http://217.216.111.217:8041
NEXT_PUBLIC_AI_SERVICE_API_KEY=your_ai_service_api_key

# Stack Auth (OAuth with Google/GitHub)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# Third-party Services
DEEPGRAM_API_KEY=your_deepgram_api_key
```

**Notes:**
- Copy `.env.example` to `.env.local` for local development
- For Docker deployment, use `.env` file
- Stack Auth variables are required for OAuth login (Google/GitHub)
- AI Service variables are required for task decomposition features
- Deepgram API key is required for voice recording features

## Common Patterns to Follow

### Error Handling
- Use `ServiceException` for API errors
- Auto-logout on 401 handled by FetchAPI
- Show toast notifications with error messages: `toast.error(message)`

### Data Fetching
- Use TanStack Query hooks for server state
- Invalidate queries after mutations: `queryClient.invalidateQueries({ queryKey: [...] })`
- Use smart polling when waiting for async processing

### Forms
- Use `react-hook-form` + `zod` for validation
- Leverage existing UI components: `Form`, `FormField`, `Input`, etc.
- Use `zodAlwaysRefine()` for async validation

### Components
- Keep feature components in route directories
- Reuse UI primitives from `/src/components/ui/`
- Use `cn()` for class merging
- Follow data-slot pattern for semantic HTML

### State Management
- Use Zustand for global state (currently just auth)
- Use TanStack Query for server state
- Use React Context for feature-scoped state (e.g., OnboardingProvider)
- Use component state for local UI state

# Rules

In Plan Mode : just anwser , dont edit 
when need a id , use uuid
Write clean, safe, maintainable code

Maintain and expand based on the style, structure of the existing code base

No artifacts.

Less code is better than more code.

No fallback mechanisms — they hide real failures.

Rewrite existing components over adding new ones (if proper)

Flag obsolete files to keep the codebase lightweight.

Avoid race conditions at all costs.

Be explicit on where snippets go (e.g., below “abc”, above “xyz”).

Take your time to ultrathink when on extended thinking mode — thinking is cheaper than fixing bugs.

Make things easy to debug, test and verify new features

Do not ever commit under claude name or mention claude in the commit


Suggest creating new branch for new features, after completed that feature push and the PR. 

Test front end using playwright mcp

After has changes , you have to explain in detail what you did , changed , refactored or added

The (external-layout) and (golden-path-layout) are parallel so if there are changes in one of these file , always check and update parallely the other


If i send you an image including icon , try to compare with lucid-icon first


The onboarding questions is hardcoded in fe , not fetch from db

Always scan global components folder  to find the general component to use

I dont use AuthGuard  anymore so dont mention it