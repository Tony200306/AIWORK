"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return <div className="col-span-12 lg:col-span-9 bg-background flex justify-center">{children}</div>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LayoutContent>{children}</LayoutContent>;
}
