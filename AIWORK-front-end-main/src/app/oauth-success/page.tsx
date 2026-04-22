"use client";

import { Suspense, useEffect, useRef } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useStackAuthStore } from "@/stores/stackAuthStore";
import { useAuthStore } from "@/stores/authStore";
import { pendingBraindump } from "@/utils/pendingBraindump";
import { Loading } from "@/components/Loading";

/**
 * OAuth Success Handler
 * This page is called after successful OAuth authentication from Stack Auth
 * It syncs the user to backend and redirects to home
 */
export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <Loading />
            <p className="text-muted-foreground">Completing sign in...</p>
          </div>
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}

function OAuthSuccessContent() {
  const user = useUser();
  const router = useRouter();
  const { setUser } = useStackAuthStore();
  const authStore = useAuthStore();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (document.cookie.includes("auth_token=")) {
                window.location.href = 'https://www.getvantum.com/thanks';
                return;
    }
    else{
      console.warn("No auth token cookie found, redirecting to stack-login");
    }
    // Only process once per user session
    if (user && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      handleOAuthSuccess();
    }

    async function handleOAuthSuccess() {
      console.log("OAuth Success - Stack Auth user:", user);

      // 1. Sync to stackAuthStore
      setUser({
        id: user.id,
        email: user.primaryEmail || '',
        displayName: user.displayName || '',
        profileImageUrl: user.profileImageUrl || undefined,
      });

      // 2. Get pending braindump ID if exists
      const pendingBraindumpId = pendingBraindump.get();
      console.log("Pending braindump ID:", pendingBraindumpId);

      // 3. OAuth login via authStore (handles token, cookie, localStorage)
      authStore.oauthLogin({
        data: {
          email: user.primaryEmail || '',
          provider: 'google', // TODO: detect from user.oauthProviders
          provider_id: user.id,
          name: user.displayName || '',
          avatar_url: user.profileImageUrl || undefined,
          braindump_id: pendingBraindumpId || undefined,
        },
        onSuccess: () => {
          // Clear pending braindump after successful linking
          pendingBraindump.clear();
          // Redirect to thanks page
          window.location.href = 'https://www.getvantum.com/thanks';
        },
        onError: () => {
          // Error already handled by authStore with toast
          console.error("OAuth login to backend failed");
          // Still redirect to thanks page even if backend sync fails
          window.location.href = 'https://www.getvantum.com/thanks';
        },
      });
    }
  }, [user, router, setUser, authStore]);

  // Show loading while processing
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loading />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
