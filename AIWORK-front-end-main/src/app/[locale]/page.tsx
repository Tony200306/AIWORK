"use client";

import { Button } from "@/components/ui/button";
import { RouteConfig, ONBOARDING_FLOW_KEYS } from "@/constants/RouteConfig";
import { useNextTranslation } from "@/hooks/useNextTranslation";
import { useAuthStore } from "@/stores/authStore";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setSessionStorageFlowKey } from "@/utils/onboardingFlowRedirect";
import { useEffect } from "react";

export default function Home() {
  const t = useNextTranslation();
  const authStore = useAuthStore();
  const router = useRouter();

  // When user accesses the homepage directly, set home-landing-page flow (preserve existing flow keys from other sources)
  useEffect(() => {
    // Only set home-landing-page if no other flow key exists
    const getVantumKey = sessionStorage.getItem(ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE);
    if (!getVantumKey) {
      setSessionStorageFlowKey(ONBOARDING_FLOW_KEYS.HOME_LANDING_PAGE);
    }
  }, []);

  const handleLogout = () => {
    authStore.logout();
  };

  const handleStartQuiz = () => {
    // Set flow to home landing page (Flow 1)
    setSessionStorageFlowKey(ONBOARDING_FLOW_KEYS.HOME_LANDING_PAGE);
    router.push(RouteConfig.YourNamePage.path);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-black via-teal-950 to-teal-900">
      {/* Center radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.3)_0%,_transparent_60%)]" />
      {/* Header */}
      {/* <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">
              {t("Metadata.site_title")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {authStore.data.userInfo && (
              <div className="flex items-center gap-3">
                <Link href={RouteConfig.ProfilePage.path}>
                  <span className="text-sm text-white/70">
                    Welcome, {authStore.data.userInfo.name || "User"}
                  </span>
                </Link>
                <ThemeToggle />

                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-30">
            <Image
              src="/white-logo.svg"
              alt="Vantum AI"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-foreground text-lg">Vantum AI</span>
          </div>

          {/* Main Text */}
          <h1 className="text-center text-4xl md:text-5xl font-medium text-foreground mb-8 max-w-4xl mx-auto leading-tight">
 What kind of Founder are you?
          </h1>
        <p className="text-center mb-5">Take this short quiz to make sure you’re prioritizing the RIGHT work</p>
          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-foreground text-black hover:bg-white/90 rounded-full px-8"
            onClick={handleStartQuiz}
          >
            Start Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
