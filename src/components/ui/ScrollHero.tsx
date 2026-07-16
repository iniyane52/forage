"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const DESKTOP_ROTATE: [number, number] = [16, 0];
const MOBILE_ROTATE: [number, number] = [8, 0];
const DESKTOP_HEADER_Y: [number, number] = [0, -40];
const MOBILE_HEADER_Y: [number, number] = [0, -16];
const DESKTOP_MAX_SCALE = 1.2;
const MOBILE_MAX_SCALE = 1.1;

/** Scroll-linked motion feels laggy/floaty rather than smooth when it tracks
 * raw scroll 1:1 — a light spring lets it settle toward the target instead
 * of jumping every frame. */
const SPRING = { stiffness: 260, damping: 34, mass: 0.6, restDelta: 0.001 };

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

/**
 * The zoomed-in start scale must never make the card wider than the
 * viewport (it has no horizontal margin below the max-w-5xl breakpoint) or
 * real content gets clipped. `offsetWidth` reads the card's laid-out width
 * unaffected by its own `transform: scale()`, so this derives the largest
 * safe scale for the current viewport instead of a fixed guess.
 *
 * The card is also rotateX-tilted while zoomed, and under `perspective` a
 * tilted plane's near edge visually magnifies beyond its plain CSS `scale()`
 * value (real 3D foreshortening, not a bug) — so the safety margin here is
 * intentionally generous to cover that on top of the scale itself.
 */
function useSafeMaxScale(cardRef: React.RefObject<HTMLDivElement | null>, desiredMax: number) {
  const [maxScale, setMaxScale] = useState(1);
  useEffect(() => {
    function measure() {
      const naturalWidth = cardRef.current?.offsetWidth;
      if (!naturalWidth) return;
      const safeViewport = window.innerWidth * 0.86;
      setMaxScale(Math.max(1, Math.min(desiredMax, safeViewport / naturalWidth)));
    }
    measure();
    const raf = requestAnimationFrame(measure); // catch late font/layout shifts
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [cardRef, desiredMax]);
  return maxScale;
}

/**
 * A tall pinned section: the header stays put while a card rotates from an
 * angled 3D perspective down to flat and zooms out to full size as the user
 * scrolls past. Reduced-motion users get a flat, static card with no scroll
 * runway at all.
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
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const maxScale = useSafeMaxScale(cardRef, isDesktop ? DESKTOP_MAX_SCALE : MOBILE_MAX_SCALE);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, SPRING);

  const rotateRange = isDesktop ? DESKTOP_ROTATE : MOBILE_ROTATE;
  const headerYRange = isDesktop ? DESKTOP_HEADER_Y : MOBILE_HEADER_Y;
  const rotateX = useTransform(smoothProgress, [0, 0.85], rotateRange);
  const scale = useTransform(smoothProgress, [0, 0.85], [maxScale, 1]);
  const headerY = useTransform(smoothProgress, [0, 0.85], headerYRange);

  if (reduce) {
    return (
      <div className={className}>
        <div>{header}</div>
        <div className="glass rounded-[28px] mt-8 md:mt-12 max-w-5xl mx-auto overflow-hidden px-4 sm:px-6">
          {card}
        </div>
      </div>
    );
  }

  return (
    <section
      ref={containerRef}
      className={`relative h-[1150px] md:h-[150vh] overflow-x-hidden ${className}`}
    >
      <div className="sticky top-20 z-10">
        <motion.div style={{ y: headerY }}>{header}</motion.div>
        <div className="px-4 sm:px-6" style={{ perspective: "1800px" }}>
          <motion.div
            ref={cardRef}
            style={{
              rotateX,
              scale,
              transformOrigin: "center top",
              willChange: "transform",
              boxShadow:
                "0 25px 80px -20px rgba(124,92,255,0.45), 0 45px 120px -40px rgba(200,107,255,0.35), inset 0 1px 0 0 rgba(255,255,255,0.08)",
            }}
            className="glass rounded-[28px] md:rounded-[32px] overflow-hidden max-w-5xl mx-auto mt-8 md:mt-12"
          >
            {card}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
