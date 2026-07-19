"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

/** Same mechanism as ScrollProgressBar.tsx (whole-page scroll, not scoped to the
 * article -- scoping would need a ref threaded from a server component, which
 * refs can't cross), tinted per-stream instead of the fixed cyan/lime gradient. */
export function ReadingProgressBar({ accent }: { accent: string }) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 34, mass: 0.5, restDelta: 0.001 });

  if (!mounted || reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 pointer-events-none"
      style={{ scaleX, backgroundColor: accent }}
    />
  );
}
