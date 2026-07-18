"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Animation-library boundary: Framer Motion (src/components/ui/motion.tsx) owns
 * FadeUp/Stagger/HoverTilt/CountUp/ScrollParallax/HeadingReveal -- everything that
 * boundary already covers well. GSAP is reserved for character-level SplitText and
 * scrub-tied-to-scroll-velocity choreography. Never animate the same element with
 * both libraries. (ScrollHero.tsx no longer uses either for pinning -- both a CSS
 * position:sticky attempt and a GSAP ScrollTrigger `pin` attempt had real,
 * unresolved bugs; see that file's own doc comment for the full history.)
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ScrollTrigger measures each trigger's start/end pixel positions once, at the
  // moment it's created -- but web fonts (next/font/google, including the heavy
  // Unbounded weights on the hero) can still be swapping in and shifting layout
  // after that, especially on a slower connection. A ScrollTrigger created before
  // that settles gets stale measurements and never corrects itself, producing a
  // scroll-pin/scrub effect that's off by however much the page grew or shrank --
  // a real bug found this session (ScrollHero's GSAP pin drifting by whole
  // multiples of its own section height depending on load timing). Refreshing once
  // fonts are confirmed loaded re-measures every trigger on the page against final
  // layout, not just this one component's.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText };

export const GSAP_EASE = "power3.out";
