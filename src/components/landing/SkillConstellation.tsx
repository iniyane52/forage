"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/components/ui/gsapMotion";
import { streamIcon } from "@/components/ui/icons";
import { pathMeta } from "@/lib/pathMeta";
import { useMounted } from "@/hooks/useMounted";

const LAYOUTS = {
  a: [
    { slug: "aiml", top: "6%", left: "5%", size: 46 },
    { slug: "software-engineer", top: "68%", left: "90%", size: 38 },
    { slug: "cloud-devops", top: "82%", left: "9%", size: 42 },
    { slug: "cybersecurity", top: "10%", left: "92%", size: 34 },
    { slug: "fullstack", top: "44%", left: "2%", size: 30 },
    { slug: "data", top: "38%", left: "95%", size: 36 },
  ],
  b: [
    { slug: "cloud-devops", top: "12%", left: "88%", size: 40 },
    { slug: "cybersecurity", top: "70%", left: "6%", size: 36 },
    { slug: "data", top: "8%", left: "8%", size: 32 },
    { slug: "aiml", top: "78%", left: "92%", size: 44 },
    { slug: "software-engineer", top: "45%", left: "96%", size: 30 },
    { slug: "fullstack", top: "40%", left: "1%", size: 34 },
  ],
} as const;

/**
 * Ambient background motion for otherwise-empty space around a section: the same
 * real stream icons used by TechTicker/PathDock, drifting slowly at low opacity in
 * each path's own accent color -- decoration grounded in the actual subject matter
 * (skills/paths), not arbitrary particles. Two hand-placed layouts so adjacent
 * sections don't read as a mechanically repeated pattern.
 *
 * Each icon gets its own randomized GSAP drift (x/y/rotate/duration/delay) rather
 * than one shared CSS keyframe -- six icons swaying in perfect unison read as
 * mechanical; independently randomized timing reads as organic.
 */
export function SkillConstellation({ variant = "a" }: { variant?: "a" | "b" }) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Gated by ScrollTrigger visibility -- with two instances of this component on the
  // page (variant "a" and "b"), all 12 tweens used to run forever from mount, even
  // scrolled far off-screen. Only the instance actually in view now does any work.
  useGSAP(
    () => {
      // `mounted` must be BOTH checked here and in the dependencies: the hydration
      // render returns null (no containerRef attached), so this effect's first run
      // early-returns -- without `mounted` in deps it never re-runs after the real
      // tree mounts, leaving the drift silently dead (same regression as
      // TerminalHeading.tsx/TechTicker.tsx).
      if (!mounted || reduce || !containerRef.current) return;
      const tweens = iconRefs.current
        .filter((el): el is HTMLSpanElement => !!el)
        .map((el) =>
          gsap.to(el, {
            x: gsap.utils.random(-14, 14),
            y: gsap.utils.random(-18, 10),
            rotate: gsap.utils.random(-8, 8),
            duration: gsap.utils.random(12, 20),
            delay: gsap.utils.random(0, 3),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          })
        );

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
      });
    },
    { scope: containerRef, dependencies: [mounted, reduce, variant] }
  );

  // Gating on `mounted` first (not just `reduce`) avoids a real hydration mismatch:
  // SSR always renders the icons (no matchMedia on the server), so a client that
  // already prefers reduced motion could disagree with the server on the very first
  // paint -- the same fix applied to ScrollProgressBar.tsx.
  if (!mounted || reduce) return null;

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      {LAYOUTS[variant].map((f, i) => {
        const meta = pathMeta[f.slug];
        const Icon = streamIcon[f.slug] ?? streamIcon.foundations;
        const accent = meta?.accent ?? "#00e5ff";
        return (
          <span
            key={i}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className="absolute"
            style={{ top: f.top, left: f.left }}
          >
            <Icon size={f.size} strokeWidth={1} style={{ color: accent, opacity: 0.14 }} />
          </span>
        );
      })}
    </div>
  );
}
