"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Thin fixed top bar that fills left-to-right as the user scrolls the whole page. */
export function ScrollProgressBar() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 34, mass: 0.5, restDelta: 0.001 });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 pointer-events-none bg-gradient-to-r from-[#00e5ff] to-[#baff2e]"
      style={{ scaleX }}
    />
  );
}
