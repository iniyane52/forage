"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

const SCRAMBLE_GLYPHS = "!<>-_\\/[]{}=+*^?#";
const SCRAMBLE_COOLDOWN_MS = 1500;
const PROXIMITY_RADIUS_PX = 120;
const MAX_LIFT_PX = 5;

/**
 * A bolder, distinct typographic register for the mid-page section transitions --
 * monospace, terminal-style character reveal with a blinking cursor, deliberately
 * different from the display-face headings used everywhere else. Used sparingly
 * (only at section-divider moments) so it reads as a beat, not decoration.
 *
 * Three layers: the scroll-scrubbed char reveal (chars fade/tilt in as the heading
 * crosses the viewport, tied to the user's own scroll), a cursor-proximity lift on
 * chars (fine-pointer only), and a terminal-appropriate hover scramble -- each char
 * briefly cycles random glyphs before snapping back, throttled so repeated hovers
 * don't strobe. The blinking cursor stays a separate, untouched Framer Motion loop.
 */
export function TerminalHeading({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const textRef = useRef<HTMLSpanElement>(null);
  const lastScrambleRef = useRef(0);

  useGSAP(
    () => {
      // `mounted` must be BOTH checked here and in the dependencies: the hydration
      // render commits the static branch (no textRef attached), so this effect's
      // first run early-returns on a null ref -- without `mounted` in deps it would
      // never re-run after the animated branch mounts, leaving the whole effect
      // silently dead (a real regression this exact component shipped with).
      if (!mounted || reduce || !textRef.current) return;

      const split = new SplitText(textRef.current, { type: "words,chars" });
      gsap.set(split.chars, { opacity: 0, rotateX: -25, z: -20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%",
          end: "top 40%",
          scrub: 0.5,
        },
      });
      // rotateX/z alongside the existing opacity reveal -- a light, CSS-only echo of the
      // hero's 3D kinetic-type idea (chars tilting in from depth) at near-zero marginal
      // cost, deliberately not a second WebGL canvas.
      tl.to(split.chars, { opacity: 1, rotateX: 0, z: 0, stagger: { each: 0.03, from: "start" } });

      let cleanupPointer: (() => void) | undefined;
      if (window.matchMedia("(pointer: fine)").matches) {
        const el = textRef.current;
        const chars = split.chars as HTMLElement[];
        const originals = chars.map((c) => c.textContent ?? "");
        const setters = chars.map((c) => gsap.quickTo(c, "y", { duration: 0.3, ease: "power3.out" }));
        let rects: DOMRect[] = [];
        const scrambleTimeouts: ReturnType<typeof setTimeout>[] = [];

        function onEnter() {
          rects = chars.map((c) => c.getBoundingClientRect());

          const now = Date.now();
          if (now - lastScrambleRef.current < SCRAMBLE_COOLDOWN_MS) return;
          lastScrambleRef.current = now;
          chars.forEach((char, i) => {
            // 2-3 quick random glyphs, then snap back to the real character --
            // timeouts (not a tween) since this is text swapping, not a property.
            const cycles = 2 + (i % 2);
            for (let step = 0; step < cycles; step++) {
              scrambleTimeouts.push(
                setTimeout(() => {
                  char.textContent = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
                }, i * 18 + step * 45)
              );
            }
            scrambleTimeouts.push(
              setTimeout(() => {
                char.textContent = originals[i];
              }, i * 18 + cycles * 45)
            );
          });
        }
        function onMove(e: MouseEvent) {
          chars.forEach((_, i) => {
            const r = rects[i];
            if (!r) return;
            const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const falloff = Math.max(0, 1 - dist / PROXIMITY_RADIUS_PX);
            setters[i](-MAX_LIFT_PX * falloff);
          });
        }
        function onLeave() {
          setters.forEach((set) => set(0));
        }

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        cleanupPointer = () => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
          scrambleTimeouts.forEach(clearTimeout);
        };
      }

      return () => {
        cleanupPointer?.();
        split.revert();
      };
    },
    { scope: textRef, dependencies: [mounted, reduce, text] }
  );

  // Gating on `mounted` first (not just `reduce`) avoids a real hydration mismatch:
  // SSR always renders the animated <h2> (no matchMedia on the server), so a client
  // that already prefers reduced motion could disagree with the server on the very
  // first paint -- same fix as ScrollProgressBar.tsx/TechTicker.tsx.
  if (!mounted || reduce) {
    return (
      <h2 className={`font-mono font-bold ${className}`}>
        <span className="text-[var(--color-primary)]">{">"}</span> {text}
      </h2>
    );
  }

  return (
    <h2 className={`font-mono font-bold ${className}`} style={{ perspective: 400 }}>
      <span className="text-[var(--color-primary)] mr-2">{">"}</span>
      <span ref={textRef}>{text}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block w-[0.5em] h-[0.85em] bg-[var(--color-primary)] ml-1 align-middle"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </h2>
  );
}
