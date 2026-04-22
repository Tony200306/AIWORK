import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { RouteConfig } from "./constants/RouteConfig";
import { defaultLocale } from "./i18n/config";
import { routing } from "./i18n/routing";
import { AuthCache } from "./lib/axios";

const intlMiddleware = createMiddleware(routing);

// Định nghĩa các route công khai (không cần đăng nhập)
const PUBLIC_ROUTES = [
  RouteConfig.LoginPage.path,
  RouteConfig.Logout.path,
  RouteConfig.ForgotPasswordPage.path,
  RouteConfig.OnboardingPage.path,
  RouteConfig.YourNamePage.path,
  RouteConfig.PrimaryRolePage.path,
  RouteConfig.WeeklyHoursPage.path,
  RouteConfig.TaskSourcesPage.path,
  RouteConfig.QuarterlyGoalPage.path,
  RouteConfig.CoreValuesPage.path,
  RouteConfig.TopClientPage.path,
  RouteConfig.ClientHealthPage.path,
  RouteConfig.ClientGoalPage.path,
  RouteConfig.ClientRevenuePage.path,
  RouteConfig.TaskTimelinePage.path,
  RouteConfig.OnboardingBrainDump.path,
  RouteConfig.OnboardingEmailCollector.path,
  RouteConfig.OnboardingCapacityReport.path,
  "/register",
  "/",
  // Stack Auth routes
  "/stack-login",
  "/handler",
  "/oauth-success",
];

// Định nghĩa các route chỉ dành cho user chưa đăng nhập
// Nếu đã đăng nhập mà vào các route này → redirect về home
const AUTH_ONLY_ROUTES = [
  RouteConfig.LoginPage.path,      // /login
  RouteConfig.ForgotPasswordPage.path, // /forgot-password
  "/register",
  "/stack-login",
  "/oauth-success"
];

// Loại bỏ locale prefix khỏi pathname
function getPathWithoutLocale(pathname: string): string {
  const localePattern = /^\/(en|cn|vn|kr)(\/.*)?$/;
  const match = pathname.match(localePattern);
  if (match) {
    // match[2] là phần sau locale (ví dụ: "/login" hoặc "/" hoặc undefined)
    const pathAfterLocale = match[2] || "/";
    return pathAfterLocale;
  }
  return pathname;
}

// Lấy locale từ pathname hoặc cookie
function getLocale(pathname: string, request: NextRequest): string {
  const localePattern = /^\/(en|cn|vn|kr)(\/|$)/;
  const match = pathname.match(localePattern);
  if (match) {
    return match[1];
  }
  // Lấy từ cookie của next-intl nếu có
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (localeCookie && ["en", "cn", "vn", "kr"].includes(localeCookie)) {
    return localeCookie;
  }
  return defaultLocale;
}

// Kiểm tra xem route có phải là public route không
function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  // All /ext/* routes are public (no auth required)
  if (pathWithoutLocale.startsWith("/ext")) {
    return true;
  }

  return PUBLIC_ROUTES.some((route) => {
    // Nếu route là "/", chỉ match khi pathWithoutLocale chính xác là "/"
    if (route === "/") {
      return pathWithoutLocale === "/";
    }
    // Các route khác: kiểm tra startsWith
    return pathWithoutLocale.startsWith(route);
  });
}
// Kiểm tra xem route có phải là auth-only route không (login, register, etc.)
// Auth-only routes chỉ dành cho user chưa đăng nhập
function isAuthOnlyRoute(pathname: string): boolean {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return AUTH_ONLY_ROUTES.some((route) => pathWithoutLocale.startsWith(route));
}

// Redirect đến login với locale
function redirectToLogin(request: NextRequest): NextResponse {
  const url = new URL(request.url);
  const locale = getLocale(url.pathname, request);
  const loginPath = `/${locale}${RouteConfig.LoginPage.path}`;
  return NextResponse.redirect(new URL(loginPath, request.url));
}

// Redirect đến home với locale
function redirectToHome(request: NextRequest): NextResponse {
  const url = new URL(request.url);
  const locale = getLocale(url.pathname, request);
  const homePath = `/${locale}/`;
  return NextResponse.redirect(new URL(homePath, request.url));
}

export default async function handler(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const pathname = url.pathname;

  // IMPORTANT: Bypass all checks for Stack Auth internal handler
  // This is the OAuth callback handler that Stack Auth controls
  if (pathname.startsWith("/handler")) {
    return NextResponse.next();
  }

  // // 1. Xử lý bot detection (giữ nguyên logic cũ)
  // if (!url.search.includes(AppConfig.IsBotParams)) {
  //   const isBot = isbot(req.headers.get("user-agent"));
  //   url.searchParams.set(AppConfig.IsBotParams, isBot.toString());
  //   return NextResponse.redirect(url.toString());
  // }

  // 2. Lấy token từ cookie
  const token = req.cookies.get(AuthCache.AUTH_TOKEN_CACHE)?.value;
  const isAuthenticated = !!token;

  // 3. Special handling for /oauth-success (no locale prefix)
  // This is an AUTH_ONLY route - redirect authenticated users to home
  if (pathname === "/oauth-success") {
    if (isAuthenticated) {
      console.log('[Middleware] Authenticated user accessing /oauth-success, redirecting to home');
      return redirectToHome(req);
    }
    // Allow unauthenticated users to proceed (they need to complete OAuth flow)
    return NextResponse.next();
  }

  // 4. Kiểm tra auth - Redirect to login if not authenticated
  // Nếu không có token và không phải public route, redirect đến login
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return redirectToLogin(req);
  }

  // 5. Redirect authenticated users away from auth-only pages
  // Nếu đã đăng nhập mà vào trang login/register → redirect về home
  if (isAuthenticated && isAuthOnlyRoute(pathname)) {
    console.log('[Middleware] Authenticated user accessing auth-only route, redirecting to home');
    return redirectToHome(req);
  }

  // 6. Xử lý next-intl middleware (giữ nguyên logic ngôn ngữ)
  return intlMiddleware(new NextRequest(url, req));
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Stack Auth routes without locale prefix (must be checked by middleware)
    "/oauth-success",
    "/handler/:path*",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(en|cn|vn|kr)/:path*",

    // Enable redirects that add missing locales
    // Exclude: api, _next, _vercel, mp (Mixpanel proxy), and files with extensions
    "/((?!api|_next|_vercel|mp|.*\\..*).*)",
  ],
};
