"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Animation-library boundary: Framer Motion (src/components/ui/motion.tsx) owns
 * FadeUp/Stagger/HoverTilt/CountUp/ScrollParallax/HeadingReveal and ScrollHero's pinned
 * tilt -- everything that boundary already covers well. GSAP is reserved for the two
 * things Framer can't do structurally: character-level SplitText and scrub-tied-to-
 * scroll-velocity choreography. Never animate the same element with both.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

export const GSAP_EASE = "power3.out";
