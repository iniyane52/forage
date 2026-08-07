"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

// Lesson-themed, kept short so a full cycle reads in a few seconds.
const SNIPPETS = [
  'def binary_search(arr, x):\n    lo, hi = 0, len(arr) - 1',
  'docker run -p 3000:3000 forage/app',
  'const user = await supabase.auth.getUser()',
];

const CHAR_MS = 38;
const HOLD_MS = 1600;

/**
 * A mini terminal pane inside the hero's dashboard mockup where lesson-themed
 * snippets type themselves out, hold, then cycle -- constant, content-grounded
 * motion right in the hero. One interval drives everything (typing and the
 * between-snippet hold are the same timer with a countdown), paused while the
 * tab is hidden. Reduced motion (or pre-mount) renders the first snippet static.
 */
export function TypingCode() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  // Characters are written straight to the DOM node -- a re-render per keystroke
  // via state would churn the whole subtree ~26 times a second for no benefit.
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mounted || reduce || !codeRef.current) return;
    const el = codeRef.current;
    let snippet = 0;
    let pos = 0;
    let holdTicks = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    function tick() {
      if (holdTicks > 0) {
        holdTicks--;
        if (holdTicks === 0) {
          snippet = (snippet + 1) % SNIPPETS.length;
          pos = 0;
          el.textContent = "";
        }
        return;
      }
      pos++;
      el.textContent = SNIPPETS[snippet].slice(0, pos);
      if (pos >= SNIPPETS[snippet].length) holdTicks = Math.round(HOLD_MS / CHAR_MS);
    }
    function start() {
      if (!interval) interval = setInterval(tick, CHAR_MS);
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
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mounted, reduce]);

  const live = mounted && !reduce;

  return (
    <div className="rounded-xl terminal-surface mt-4 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
        <span className="w-2 h-2 rounded-full bg-[#ff4757]/60" />
        <span className="w-2 h-2 rounded-full bg-[#ffb020]/60" />
        <span className="w-2 h-2 rounded-full bg-[#3fb950]/60" />
        <span className="ml-2 text-[9px] font-mono text-[#7d99a3]">lesson-workspace</span>
      </div>
      <pre className="px-3 py-2.5 text-[10px] leading-relaxed font-mono text-[#9fe8f0] whitespace-pre-wrap min-h-[3.2em]">
        <span className="text-[#baff2e]">$ </span>
        <code ref={codeRef}>{live ? "" : SNIPPETS[0]}</code>
        {live && (
          <span
            className="inline-block w-[0.55em] h-[1em] bg-[#00e5ff] align-text-bottom ml-0.5"
            style={{ animation: "forage-cursor-blink 1s steps(1) infinite" }}
          />
        )}
      </pre>
    </div>
  );
}
