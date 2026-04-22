"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Loading } from "./Loading";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding",
  "/stack-login",
  "/stack-register",
  "/stack",
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const authStore = useAuthStore();

  const pathWithoutLocale = useMemo(() => {
    return pathname.replace(/^\/(en|cn)/, "") || "/";
  }, [pathname]);

  const isPublicRoute = useMemo(() => {
    // All /ext/* routes are public (no auth required)
    if (pathWithoutLocale.startsWith("/ext")) {
      return true;
    }

    return publicRoutes.some((route) => {
      // Nếu route là "/", chỉ match khi pathWithoutLocale chính xác là "/"
      if (route === "/") {
        return pathWithoutLocale === "/";
      }
      // Các route khác: kiểm tra startsWith
      return pathWithoutLocale.startsWith(route);
    });
  }, [pathWithoutLocale]);

  // Wait for store to hydrate from localStorage before checking auth
  const isHydrated = authStore._hasHydrated;
  const shouldRedirect = isHydrated && !isPublicRoute && !authStore.data.token?.accessToken;

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/login");
    }
  }, [shouldRedirect, router]);

  // Show loading while hydrating or redirecting
  if (!isHydrated || shouldRedirect) {
    return <Loading />;
  }

  return <>{children}</>;
}
