import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

// Force dynamic rendering for OAuth handlers
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Handler(props: any) {
  return <StackHandler app={stackServerApp} {...props} />;
}
