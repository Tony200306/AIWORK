import { useEffect, useState } from "react";

/**
 * Hook to detect if the current viewport is mobile size
 * Uses Tailwind's default md breakpoint (768px)
 * @param breakpoint - Custom breakpoint in pixels (default: 768)
 * @returns boolean indicating if viewport is mobile size
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
};
