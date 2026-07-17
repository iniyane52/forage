"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, GSAP_EASE } from "@/components/ui/gsapMotion";

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

      const tl = gsap.timeline();
      tl.from(leadSplit.chars, {
        opacity: 0,
        yPercent: 70,
        rotateX: -70,
        stagger: 0.02,
        duration: 0.7,
        ease: GSAP_EASE,
      })
        .from(
          gradientRef.current,
          { opacity: 0, scale: 0.85, duration: 0.5, ease: GSAP_EASE },
          "<0.1"
        )
        .from(
          tailSplit.chars,
          {
            opacity: 0,
            yPercent: 70,
            rotateX: -70,
            stagger: 0.02,
            duration: 0.7,
            ease: GSAP_EASE,
          },
          "<0.15"
        );

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
      className="display text-4xl sm:text-6xl md:text-7xl mb-5"
      style={{ perspective: 400 }}
    >
      <span ref={leadRef}>Learn it. </span>
      <span ref={gradientRef} className="gradient-word inline-block">
        Prove it.
      </span>
      <span ref={tailRef}> Get hired.</span>
    </h1>
  );
}
