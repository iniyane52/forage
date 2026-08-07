"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

const TILT_MAX_DEG = 9;
const GLOW_SIZE = 260;

/**
 * Asymmetric split hero: copy on the left, a glass product card on the right,
 * desktop; stacks on mobile. The card settles into place with a one-shot
 * zoom-in entrance (scale + fade, `once: true`, plain scroll-reveal via
 * ScrollTrigger) -- deliberately NOT a scroll-tied pin. An earlier version of
 * this component tried pinning the hero while scrolling and hit a real,
 * unresolved bug (see git history / CLAUDE.md); a one-shot reveal has none of
 * that risk since it plays once and stops.
 *
 * Used to settle into a fixed -4deg rotation and stay there. Now -- desktop/
 * fine-pointer only -- the card instead tracks the cursor with a real 3D tilt
 * (rotateX/rotateY mapped to pointer position within the card) plus a moving
 * specular highlight, so it reads as a physical glass object you can look
 * around rather than a flat image with one baked-in angle. Reference: Raycast's
 * hero command palette, Drift's mouse-driven product mockup tilt.
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
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduce || !mounted || !cardRef.current) return;
      const cardEl = cardRef.current;

      // Plain play-on-mount, deliberately NOT scrollTrigger-gated: this card is
      // always above the fold at page load, so "wait for a scroll-triggered
      // enter" was actively wrong here, not just imprecise. Confirmed live: with
      // a scrollTrigger (start: "top 90%", once: true), the card was stuck
      // invisible (opacity 0) on a fresh load and only appeared after scrolling
      // away and back -- ScrollTrigger only checks/fires against the scroll
      // position it had at CREATION time, and a page load fires no scroll event
      // to prompt a recheck, so an already-satisfied trigger silently never
      // fires. A follow-up ScrollTrigger.refresh() call didn't fix it either
      // (refresh recalculates trigger positions, it doesn't retroactively fire
      // enter callbacks for non-scrubbed tweens). Since there's no real "wait
      // for scroll" case to handle for an always-visible-on-load element, this
      // sidesteps the whole class of bug rather than chasing the timing.
      gsap.set(cardEl, { transformPerspective: 1000, scale: 1.06, rotate: -3, opacity: 0 });
      gsap.to(cardEl, { scale: 1, rotate: 0, opacity: 1, duration: 1, ease: "power3.out" });

      if (!window.matchMedia("(pointer: fine)").matches) return;

      // Plain gsap.to (not quickTo) for the tilt: quickTo's fast-path reset tracking
      // gets confused when another gsap call (the entrance tween above) already
      // touched this element's transform -- it logs a real "not eligible for reset"
      // warning, confirmed live, the same class of issue PathDock.tsx hit with
      // quickTo("scale") and worked around by splitting into scaleX/scaleY. rotateX/
      // rotateY have no such split, so plain `.to()` with `overwrite: "auto"` (GSAP
      // cleanly overwrites the prior tween on the same properties) is the fix here.
      const setGlowX = glowRef.current ? gsap.quickTo(glowRef.current, "x", { duration: 0.35, ease: "power3.out" }) : null;
      const setGlowY = glowRef.current ? gsap.quickTo(glowRef.current, "y", { duration: 0.35, ease: "power3.out" }) : null;

      function onMove(e: MouseEvent) {
        const rect = cardEl.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        gsap.to(cardEl, {
          rotateX: -(relY - 0.5) * TILT_MAX_DEG * 2,
          rotateY: (relX - 0.5) * TILT_MAX_DEG * 2,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
        setGlowX?.(relX * rect.width - GLOW_SIZE / 2);
        setGlowY?.(relY * rect.height - GLOW_SIZE / 2);
      }
      function onLeave() {
        gsap.to(cardEl, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      }

      cardEl.addEventListener("mousemove", onMove);
      cardEl.addEventListener("mouseleave", onLeave);
      return () => {
        cardEl.removeEventListener("mousemove", onMove);
        cardEl.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: cardRef, dependencies: [reduce, mounted] }
  );

  return (
    <div className={`grid lg:grid-cols-[1.05fr_1fr] items-center gap-10 lg:gap-16 ${className}`}>
      <div>{header}</div>
      <div
        ref={cardRef}
        className="relative glass-solid rounded-[28px] overflow-hidden mx-auto lg:mx-0 max-w-xl w-full"
      >
        <div
          ref={glowRef}
          aria-hidden="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            width: GLOW_SIZE,
            height: GLOW_SIZE,
            top: 0,
            left: 0,
            background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)",
            mixBlendMode: "overlay",
          }}
        />
        {card}
      </div>
    </div>
  );
}
