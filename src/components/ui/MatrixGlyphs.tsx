"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

// Real tokens from what Forage actually teaches, not decorative noise -- a visitor
// half-reading these should recognize "def", "SELECT", "docker run" as real syntax
// tied to the product, not abstract matrix-rain katakana/hex with no connection to
// the brand.
const GLYPHS = [
  "def", "const", "async", "await", "class", "import", "return", "=>",
  "SELECT", "docker run", "git commit", "npm i", "useState()", "O(n)",
  "try/catch", "kubectl", "GROUP BY", "fetch()", "{ }", "grep -r",
];
const GLYPH_COUNT = 28;
const FLIP_INTERVAL_MS = 420;

type Glyph = {
  top: number;
  left: number;
  size: number;
  char: string;
  accent: string | null;
};

function randomChar() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

/**
 * The "live" layer of the background: scattered real code tokens (the same syntax
 * Forage's lessons actually teach -- `def`, `SELECT`, `docker run`, not abstract
 * matrix-rain symbols) at low opacity across the viewport, each occasionally
 * flipping to a new token -- calm, on-brand energy over the grid, not filler noise.
 *
 * One shared setInterval flips 1-2 random glyphs per tick (CSS transition does the
 * actual flip; JS only swaps the character at the flip midpoint) -- no rAF loop, no
 * per-glyph timers, and the interval stops entirely while the tab is hidden.
 * Layout is randomized once at mount; the whole layer renders client-side only
 * (mounted gate), so the randomness never touches SSR/hydration.
 */
export function MatrixGlyphs() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [glyphs] = useState<Glyph[]>(() =>
    Array.from({ length: GLYPH_COUNT }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 11 + Math.random() * 5,
      char: randomChar(),
      accent: i % 5 === 0 ? (i % 10 === 0 ? "#00e5ff" : "#baff2e") : null,
    }))
  );

  useEffect(() => {
    if (!mounted || reduce) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    function flipOne() {
      const span = spanRefs.current[Math.floor(Math.random() * spanRefs.current.length)];
      if (!span) return;
      span.style.transform = "rotateX(90deg)";
      const t = setTimeout(() => {
        timeouts.delete(t);
        span.textContent = randomChar();
        span.style.transform = "rotateX(0deg)";
      }, 160);
      timeouts.add(t);
    }
    function start() {
      if (interval) return;
      interval = setInterval(() => {
        flipOne();
        if (Math.random() > 0.5) flipOne();
      }, FLIP_INTERVAL_MS);
    }
    function stop() {
      if (interval) clearInterval(interval);
      interval = null;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      timeouts.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mounted, reduce]);

  if (!mounted || reduce) return null;

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {glyphs.map((g, i) => (
        <span
          key={i}
          ref={(el) => {
            spanRefs.current[i] = el;
          }}
          className="absolute font-mono select-none"
          style={{
            top: `${g.top}%`,
            left: `${g.left}%`,
            fontSize: g.size,
            color: g.accent ?? "#ffffff",
            opacity: g.accent ? 0.12 : 0.07,
            transform: "rotateX(0deg)",
            transition: "transform 160ms ease-in",
          }}
        >
          {g.char}
        </span>
      ))}
    </div>
  );
}
