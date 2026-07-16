"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin top progress bar shown briefly on route change — GitHub/YouTube style.
 * Deliberately NOT using Next's `loading.tsx` (a Suspense boundary that, in this
 * Next 16 + Turbopack setup, can get stuck permanently pending on hard
 * navigations and hide page content). This is a pure client-side visual cue
 * driven by pathname changes, so it can never block or hide real content.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 380);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#00e5ff] via-[#ff3d81] to-[#baff2e]"
        style={{
          width: visible ? "100%" : "0%",
          transition: visible ? "width 380ms ease-out" : "none",
        }}
      />
    </div>
  );
}
