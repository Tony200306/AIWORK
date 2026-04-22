import { StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { StackAuthGuard } from "@/components/StackAuthGuard";

export default function StackAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackServerApp}>
      <StackAuthGuard>{children}</StackAuthGuard>
    </StackProvider>
  );
}
