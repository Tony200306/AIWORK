"use client";

import { initMixpanel } from "@/lib/mixpanel";
import { useEffect } from "react";

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
       console.log("MixpanelProvider mounted");
    initMixpanel();
  }, []);

  return <>{children}</>;
}
