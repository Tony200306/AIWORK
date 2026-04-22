"use client";

import { useUser } from "@stackframe/stack";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Loading } from "./Loading";

const publicRoutes = [
  "/stack-login",
  "/handler",
];

function StackAuthGuardContent({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.includes(route)
  );

  useEffect(() => {
    if (!user && !isPublicRoute) {
      router.push("/stack-login");
    }
  }, [user, isPublicRoute, router]);

  if (!user && !isPublicRoute) {
    return <Loading />;
  }

  return <>{children}</>;
}

export function StackAuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <StackAuthGuardContent>{children}</StackAuthGuardContent>
    </Suspense>
  );
}
