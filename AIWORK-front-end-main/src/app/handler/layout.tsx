import { StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

// Force dynamic rendering for OAuth handlers
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HandlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackServerApp}>
      {children}
    </StackProvider>
  );
}
