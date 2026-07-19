"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

// Approximate cumulative scroll fractions for each landing-page section, in order --
// decorative only (not measured against real DOM heights), so these are hand-tuned
// round numbers matching the page's actual section proportions (How it works runs
// long because of its own internal scroll-scrub, so it gets the widest band).
const NODES = [
  { label: "Learn it", fraction: 0.03 },
  { label: "Toolkit", fraction: 0.16 },
  { label: "How it works", fraction: 0.33 },
  { label: "Career paths", fraction: 0.58 },
  { label: "Interview", fraction: 0.72 },
  { label: "Pricing", fraction: 0.85 },
];

/**
 * A thin glowing line docked to the left edge, fixed to the viewport, that fills
 * top-to-bottom as the whole page scrolls -- the connecting "flow" thread tying
 * every section together into one continuous journey rather than a stack of
 * separate blocks, with small nodes lighting up as the fill passes them.
 *
 * Fixed positioning is deliberate and correct here (unlike the old aurora blobs,
 * which were wrongly `position: fixed` and bled into unrelated sections): this
 * represents whole-page scroll progress, the same category of UI as
 * ScrollProgressBar's top bar, not section-scoped decoration.
 *
 * `xl:` and up only (1280px+): below that, every container on this page is at or
 * near full-bleed against the viewport edge, so a rail at the edge would sit on top
 * of real content instead of in a genuine margin.
 */
export function ScrollThread() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 240, damping: 40, mass: 0.5, restDelta: 0.001 });

  if (!mounted || reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden xl:block fixed left-10 top-0 bottom-0 w-px z-10 pointer-events-none"
    >
      <div className="absolute inset-0 bg-white/[0.07]" />
      <motion.div
        className="absolute inset-x-0 top-0 bottom-0 origin-top bg-gradient-to-b from-[#00e5ff] via-[#baff2e] to-[#ff3d81]"
        style={{ scaleY, boxShadow: "0 0 12px 1px rgba(0,229,255,0.45)" }}
      />
      {NODES.map((n) => (
        <ThreadNode key={n.label} fraction={n.fraction} progress={scrollYProgress} />
      ))}
    </div>
  );
}

function ThreadNode({ fraction, progress }: { fraction: number; progress: MotionValue<number> }) {
  const range: [number, number] = [Math.max(0, fraction - 0.015), fraction];
  const opacity = useTransform(progress, range, [0.3, 1]);
  const scale = useTransform(progress, range, [0.6, 1]);

  return (
    <motion.div
      className="absolute left-1/2 w-2 h-2 rounded-full bg-[#00e5ff]"
      style={{
        top: `${fraction * 100}%`,
        x: "-50%",
        y: "-50%",
        opacity,
        scale,
        boxShadow: "0 0 8px 2px rgba(0,229,255,0.55)",
      }}
    />
  );
}
