"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

/**
 * Asymmetric split hero: copy on the left, a slightly tilted glass product
 * card on the right, desktop; stacks on mobile. The card settles into place
 * with a one-shot zoom-in entrance (scale + rotate + fade, `once: true`,
 * plain scroll-reveal via ScrollTrigger) -- deliberately NOT a scroll-tied
 * pin. An earlier version of this component tried pinning the hero while
 * scrolling and hit a real, unresolved bug (see git history / CLAUDE.md);
 * a one-shot reveal has none of that risk since it plays once and stops.
 */
export function ScrollHero({
  header,
  card,
  className = "",
}: {
  header: React.ReactNode;
  card: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduce || !mounted || !cardRef.current) return;

      gsap.set(cardRef.current, {
        transformPerspective: 1000,
        rotate: -10,
        scale: 1.06,
        opacity: 0,
      });
      gsap.to(cardRef.current, {
        rotate: -4,
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 90%", once: true },
      });
    },
    { scope: cardRef, dependencies: [reduce, mounted] }
  );

  return (
    <div className={`grid lg:grid-cols-[1.05fr_1fr] items-center gap-10 lg:gap-16 ${className}`}>
      <div>{header}</div>
      <div
        ref={cardRef}
        className="glass-solid rounded-[28px] overflow-hidden mx-auto lg:mx-0 max-w-xl w-full"
        // Gated on `mounted` first, not just `reduce`: SSR has no `matchMedia`, so it
        // always renders as if motion were allowed, but framer-motion's
        // `useReducedMotion` reads the real value synchronously on the client's very
        // first render (before hydration completes) -- if the visitor actually prefers
        // reduced motion, that first client render disagrees with the server's markup
        // immediately, a real hydration-mismatch error confirmed live. Matches the same
        // fix already applied in SkillConstellation.tsx/ScrollProgressBar.tsx.
        style={!mounted || reduce ? undefined : { transform: "rotate(-4deg)" }}
      >
        {card}
      </div>
    </div>
  );
}
