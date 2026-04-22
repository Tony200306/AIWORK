"use client";
import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  urls: {
    handler: "/handler",
    afterSignIn: "/oauth-success", // Custom OAuth success handler (no locale prefix)
  },
});
