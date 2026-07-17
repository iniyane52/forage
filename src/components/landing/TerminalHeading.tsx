"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/components/ui/gsapMotion";

/**
 * A bolder, distinct typographic register for the mid-page section transitions --
 * monospace, terminal-style character reveal with a blinking cursor, deliberately
 * different from the display-face headings used everywhere else. Used sparingly
 * (only at section-divider moments) so it reads as a beat, not decoration.
 *
 * The reveal is scroll-scrubbed (GSAP ScrollTrigger), not a one-shot animation --
 * chars fade in as the heading crosses the viewport, tying the "typing" feel to the
 * user's own scroll motion rather than a fixed timer. The blinking cursor stays a
 * separate, untouched Framer Motion loop (not scroll-tied, no reason to migrate it).
 */
export function TerminalHeading({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (reduce || !textRef.current) return;

      const split = new SplitText(textRef.current, { type: "words,chars" });
      gsap.set(split.chars, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%",
          end: "top 40%",
          scrub: 0.5,
        },
      });
      tl.to(split.chars, { opacity: 1, stagger: { each: 0.03, from: "start" } });

      return () => split.revert();
    },
    { scope: textRef, dependencies: [reduce, text] }
  );

  if (reduce) {
    return (
      <h2 className={`font-mono font-bold ${className}`}>
        <span className="text-[#00e5ff]">{">"}</span> {text}
      </h2>
    );
  }

  return (
    <h2 className={`font-mono font-bold ${className}`}>
      <span className="text-[#00e5ff] mr-2">{">"}</span>
      <span ref={textRef}>{text}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block w-[0.5em] h-[0.85em] bg-[#00e5ff] ml-1 align-middle"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </h2>
  );
}
