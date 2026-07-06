"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#7c5cff", "#c86bff", "#46e0ff", "#3fb950", "#e3a008"];

/** A one-shot confetti burst. Mount it (e.g. when a quiz is passed). Respects reduced-motion. */
export function Confetti({ count = 28 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: -(80 + Math.random() * 220),
        rot: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.15,
        size: 6 + Math.random() * 6,
      })),
    [count]
  );

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{ width: p.size, height: p.size * 1.6, background: p.color }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rot }}
          transition={{ duration: 1.1, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
