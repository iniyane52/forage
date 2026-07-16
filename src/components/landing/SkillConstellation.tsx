"use client";

import { useReducedMotion } from "framer-motion";
import { streamIcon } from "@/components/ui/icons";
import { pathMeta } from "@/lib/pathMeta";

const LAYOUTS = {
  a: [
    { slug: "aiml", top: "6%", left: "5%", size: 46, duration: 14, delay: 0 },
    { slug: "software-engineer", top: "68%", left: "90%", size: 38, duration: 17, delay: 1.5 },
    { slug: "cloud-devops", top: "82%", left: "9%", size: 42, duration: 15, delay: 3 },
    { slug: "cybersecurity", top: "10%", left: "92%", size: 34, duration: 18, delay: 0.8 },
    { slug: "fullstack", top: "44%", left: "2%", size: 30, duration: 16, delay: 2.2 },
    { slug: "data", top: "38%", left: "95%", size: 36, duration: 19, delay: 1 },
  ],
  b: [
    { slug: "cloud-devops", top: "12%", left: "88%", size: 40, duration: 16, delay: 0.5 },
    { slug: "cybersecurity", top: "70%", left: "6%", size: 36, duration: 14, delay: 2 },
    { slug: "data", top: "8%", left: "8%", size: 32, duration: 18, delay: 1.2 },
    { slug: "aiml", top: "78%", left: "92%", size: 44, duration: 15, delay: 0 },
    { slug: "software-engineer", top: "45%", left: "96%", size: 30, duration: 17, delay: 2.6 },
    { slug: "fullstack", top: "40%", left: "1%", size: 34, duration: 19, delay: 1.8 },
  ],
} as const;

/**
 * Ambient background motion for otherwise-empty space around a section: the same
 * real stream icons used by TechTicker/PathGrid, drifting slowly at low opacity in
 * each path's own accent color -- decoration grounded in the actual subject matter
 * (skills/paths), not arbitrary particles. Two hand-placed layouts so adjacent
 * sections don't read as a mechanically repeated pattern.
 */
export function SkillConstellation({ variant = "a" }: { variant?: "a" | "b" }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      {LAYOUTS[variant].map((f, i) => {
        const meta = pathMeta[f.slug];
        const Icon = streamIcon[f.slug] ?? streamIcon.foundations;
        const accent = meta?.accent ?? "#00e5ff";
        return (
          <span
            key={i}
            className="absolute forage-float"
            style={{ top: f.top, left: f.left, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` }}
          >
            <Icon size={f.size} strokeWidth={1} style={{ color: accent, opacity: 0.14 }} />
          </span>
        );
      })}
    </div>
  );
}
