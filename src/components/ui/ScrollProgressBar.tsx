"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

/** Thin fixed top bar that fills left-to-right as the user scrolls the whole page. */
export function ScrollProgressBar() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 34, mass: 0.5, restDelta: 0.001 });

  // Gating on `mounted` first (not just `reduce`) avoids a real hydration mismatch:
  // SSR always renders the bar (no matchMedia on the server), so a client that already
  // prefers reduced motion could disagree with the server on the very first paint.
  if (!mounted || reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 pointer-events-none bg-gradient-to-r from-[#00e5ff] to-[#baff2e]"
      style={{ scaleX }}
    />
  );
}
