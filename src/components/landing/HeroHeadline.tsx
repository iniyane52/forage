"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

/**
 * One-time character reveal on mount, not scroll-scrubbed -- ScrollHero's own card
 * entrance (a separate one-shot GSAP reveal, not scroll-tied) animates independently,
 * so there's no shared scroll target or property overlap between the two.
 *
 * The "Prove it." span is deliberately NOT run through SplitText: `.highlight-block`
 * paints a solid rectangle behind the whole span, and SplitText replaces its glyphs
 * with nested char divs that would each need their own slice of that background to
 * look continuous -- so it's simpler and more correct to animate that span as one
 * unit (scale/fade) alongside the char reveal on either side.
 * Splitting with `type: "words,chars"` (not just "chars") matters too: a plain char
 * split lets the browser insert a line break between any two adjacent letters, which
 * broke "hired." across lines; the word-level wrapper keeps each word atomic.
 */
export function HeroHeadline() {
  const reduce = useReducedMotion();
  // `mounted` gate: not for hydration (this component renders one unbranched tree),
  // but so this effect re-runs in the same commit cycle where IntroSplash -- an
  // earlier sibling, whose own layout effect fires first -- has set
  // `<html data-splash="1">`. On the raw hydration commit that flag can't exist yet,
  // so an ungated run here would always see "no splash" and start the entrance
  // behind the overlay.
  const mounted = useMounted();
  const rootRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const gradientRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!mounted || reduce || !leadRef.current || !gradientRef.current || !tailRef.current) return;

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

      // Proximity lift binds only after the entrance timeline completes -- both
      // effects write transforms to the same char elements, and binding early
      // would let a stray mousemove fight the entrance mid-tumble.
      let entranceDone = false;
      // If the intro splash is covering the page, hold the entrance until its
      // push-in reveal (the `forage-splash-done` event) -- otherwise the tumble
      // plays out hidden behind the overlay and is over by the time it's visible.
      // 5s safety timeout so a missed event can never leave the headline frozen.
      const splashActive = document.documentElement.dataset.splash === "1";
      const tl = gsap.timeline({
        paused: splashActive,
        onComplete: () => {
          entranceDone = true;
        },
      });
      let splashCleanup: (() => void) | undefined;
      if (splashActive) {
        const play = () => tl.play();
        window.addEventListener("forage-splash-done", play, { once: true });
        const safety = setTimeout(play, 5000);
        splashCleanup = () => {
          window.removeEventListener("forage-splash-done", play);
          clearTimeout(safety);
        };
      }
      tl.from(leadSplit.chars, tumbleVars)
        .from(
          gradientRef.current,
          { opacity: 0, scale: 0.8, duration: 0.5, ease: "back.out(2.2)" },
          "<0.1"
        )
        .from(tailSplit.chars, tumbleVars, "<0.15");

      let cleanupProximity: (() => void) | undefined;
      if (window.matchMedia("(pointer: fine)").matches && rootRef.current) {
        // The gradient "Prove it." span is deliberately un-split (see the doc comment
        // above) -- it participates as one unit alongside the individual chars.
        const targets: HTMLElement[] = [
          ...(leadSplit.chars as HTMLElement[]),
          gradientRef.current,
          ...(tailSplit.chars as HTMLElement[]),
        ];
        const setters = targets.map((t) => gsap.quickTo(t, "y", { duration: 0.35, ease: "power3.out" }));
        let rects: DOMRect[] = [];
        const RADIUS = 130;
        const LIFT = 9;

        function onEnter() {
          rects = targets.map((t) => t.getBoundingClientRect());
        }
        function onMove(e: MouseEvent) {
          if (!entranceDone) return;
          targets.forEach((_, i) => {
            const r = rects[i];
            if (!r) return;
            const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const falloff = Math.max(0, 1 - dist / RADIUS);
            setters[i](-LIFT * falloff);
          });
        }
        function onLeave() {
          setters.forEach((set) => set(0));
        }

        const el = rootRef.current;
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        cleanupProximity = () => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        };
      }

      return () => {
        splashCleanup?.();
        cleanupProximity?.();
        leadSplit.revert();
        tailSplit.revert();
      };
    },
    { scope: rootRef, dependencies: [mounted, reduce] }
  );

  return (
    <h1
      ref={rootRef}
      className="display font-hero text-4xl sm:text-5xl lg:text-6xl mb-5"
      style={{ perspective: 650 }}
    >
      <span ref={leadRef}>Learn it. </span>
      <span ref={gradientRef} className="highlight-block inline-block">
        Prove it.
      </span>
      <span ref={tailRef}> Get hired.</span>
    </h1>
  );
}
