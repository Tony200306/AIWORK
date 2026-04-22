import { StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OAuthSuccessLayout({
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
