"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Loading } from "@/components/Loading";
import { RouteConfig } from "@/constants/RouteConfig";

interface Props {
  children: ReactNode;
}

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function Layout({ children }: Props) {
  const router = useRouter();
  const authStore = useAuthStore();

  // useEffect(() => {
  //   if (authStore.data.userInfo) {
  //     router.push(RouteConfig.HomePage.path);
  //   }
  // }, [authStore.data.userInfo, router]);

  // if (authStore.data.userInfo) {
  //   return <Loading />;
  // }

  return <>{children}</>;
}
