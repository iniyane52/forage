"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/components/ui/gsapMotion";

/**
 * One-time character reveal on mount, not scroll-scrubbed -- ScrollHero's own
 * scroll-driven tilt lives on the card below this, so there's no shared scroll target
 * or property overlap between the two.
 *
 * The gradient-clipped "Prove it." span is deliberately NOT run through SplitText:
 * `.gradient-word` relies on `background-clip: text` painting the parent span's own
 * text glyphs, and SplitText replaces those glyphs with nested char divs that have no
 * background of their own -- clipping the gradient per-character would need a
 * background-position hack to look continuous, so it's simpler and more correct to
 * animate that span as one unit (scale/fade) alongside the char reveal on either side.
 * Splitting with `type: "words,chars"` (not just "chars") matters too: a plain char
 * split lets the browser insert a line break between any two adjacent letters, which
 * broke "hired." across lines; the word-level wrapper keeps each word atomic.
 */
export function HeroHeadline() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const gradientRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (reduce || !leadRef.current || !gradientRef.current || !tailRef.current) return;

      const leadSplit = new SplitText(leadRef.current, { type: "words,chars" });
      const tailSplit = new SplitText(tailRef.current, { type: "words,chars" });

      // Each char gets its own randomized rotateY/z on top of the shared rotateX --
      // chars visibly tumble in from depth at slightly different angles instead of
      // rising in lockstep, a cheap (pure compositor transform, no WebGL) way to read
      // as real 3D kinetic type. Steeper rotateX (-90 vs the previous -70) plus a
      // slightly deeper perspective (set on the root <h1> below) push the effect
      // further without changing the underlying mechanism.
      const tumbleVars = {
        opacity: 0,
        yPercent: 70,
        rotateX: -90,
        rotateY: () => gsap.utils.random(-25, 25),
        z: () => gsap.utils.random(-60, 20),
        stagger: { each: 0.02, from: "random" as const },
        duration: 0.8,
        ease: "back.out(1.7)",
      };

      const tl = gsap.timeline();
      tl.from(leadSplit.chars, tumbleVars)
        .from(
          gradientRef.current,
          { opacity: 0, scale: 0.8, duration: 0.5, ease: "back.out(2.2)" },
          "<0.1"
        )
        .from(tailSplit.chars, tumbleVars, "<0.15");

      return () => {
        leadSplit.revert();
        tailSplit.revert();
      };
    },
    { scope: rootRef, dependencies: [reduce] }
  );

  return (
    <h1
      ref={rootRef}
      className="display font-hero text-4xl sm:text-6xl md:text-7xl mb-5"
      style={{ perspective: 650 }}
    >
      <span ref={leadRef}>Learn it. </span>
      <span ref={gradientRef} className="gradient-word inline-block">
        Prove it.
      </span>
      <span ref={tailRef}> Get hired.</span>
    </h1>
  );
}
