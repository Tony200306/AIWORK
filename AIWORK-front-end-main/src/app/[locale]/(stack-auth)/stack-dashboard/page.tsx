"use client";

import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { stackClientApp } from "@/stack/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";

function StackDashboardContent() {
  const user = useUser();
  const router = useRouter();

  if (!user) {
    router.push('/stack-login');
    return null;
  }

  const handleLogout = async () => {
    await stackClientApp.signOut();
    router.push('/stack-login');
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stack Auth Dashboard</h1>
            <p className="text-muted-foreground">Welcome back!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Information</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {user.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.primaryEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This is a demo dashboard for Stack Auth integration.
            </p>
            <p className="text-sm text-muted-foreground">
              You can extend this with brain-dump, kanban features using Stack Auth backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StackDashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StackDashboardContent />
    </Suspense>
  );
}
