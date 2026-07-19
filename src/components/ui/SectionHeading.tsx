"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

const PROXIMITY_RADIUS_PX = 140;
const MAX_LIFT_PX = 7;

/**
 * Shared kinetic treatment for the page's plain display headings, three layers:
 * a one-shot word-level rise reveal on first scroll into view (words not chars --
 * deliberately lighter than the hero's char tumble so it reads as an echo, not a
 * repeat), a cursor-proximity lift on each word after the reveal settles, and a
 * one-shot gradient sweep across the text on hover.
 *
 * Proximity is per-word gsap.quickTo, driven by one mousemove listener on the
 * heading itself with word rects cached on mouseenter -- never re-measured
 * per-event (same discipline as InterviewSpotlight/FinalCTA). Fine-pointer only.
 */
export function SectionHeading({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: string;
  className?: string;
  as?: "h2" | "h3";
}) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const rootRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!mounted || reduce || !textRef.current || !rootRef.current) return;

      const split = new SplitText(textRef.current, { type: "words" });
      let revealed = false;

      gsap.from(split.words, {
        opacity: 0,
        y: 26,
        duration: 0.6,
        ease: "back.out(1.6)",
        stagger: 0.05,
        scrollTrigger: { trigger: rootRef.current, start: "top 88%", once: true },
        onComplete: () => {
          revealed = true;
        },
      });

      let cleanupProximity: (() => void) | undefined;
      if (window.matchMedia("(pointer: fine)").matches) {
        const setters = split.words.map((w) => gsap.quickTo(w, "y", { duration: 0.35, ease: "power3.out" }));
        let rects: DOMRect[] = [];

        function onEnter() {
          rects = split.words.map((w) => (w as HTMLElement).getBoundingClientRect());
        }
        function onMove(e: MouseEvent) {
          // Not before the reveal settles -- the reveal's own `y` tween and the
          // proximity setter would fight over the same property.
          if (!revealed) return;
          split.words.forEach((_, i) => {
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
        cleanupProximity?.();
        split.revert();
      };
    },
    { scope: rootRef, dependencies: [mounted, reduce, children] }
  );

  if (!mounted || reduce) {
    return <Tag className={`display ${className}`}>{children}</Tag>;
  }

  return (
    <Tag ref={rootRef} className={`display heading-sweep ${className}`}>
      <span ref={textRef} className="inline-block">
        {children}
      </span>
    </Tag>
  );
}
