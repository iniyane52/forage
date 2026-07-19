"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

/**
 * A single large, blurred radial glow that trails the cursor across the whole
 * page -- reads as the background grid lighting up near the pointer, not a
 * spotlight. The same element also carries the scroll-tied shift: its color
 * interpolates through the brand ramp (cyan -> lime -> pink) as the page
 * scrolls, so one composited element delivers both behaviors.
 *
 * quickTo for the trailing (never React state -- continuous pointer values
 * re-rendering the tree per move is the exact anti-pattern this codebase's
 * magnetic-hover components already avoid). Fine-pointer devices only: on
 * touch there is no cursor to react to, so the layer never binds.
 */
export function CursorGlow() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const glowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const glowColor = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    ["rgba(0,229,255,0.16)", "rgba(186,255,46,0.12)", "rgba(255,61,129,0.14)"]
  );

  useEffect(() => {
    if (!mounted || reduce || !glowRef.current) return;
    const el = glowRef.current;
    const unsub = glowColor.on("change", (c) => {
      el.style.background = `radial-gradient(circle at center, ${c}, transparent 65%)`;
    });
    el.style.background = `radial-gradient(circle at center, ${glowColor.get()}, transparent 65%)`;
    return unsub;
  }, [mounted, reduce, glowColor]);

  useGSAP(
    () => {
      if (!mounted || reduce || !glowRef.current) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const setX = gsap.quickTo(glowRef.current, "x", { duration: 0.6, ease: "power3.out" });
      const setY = gsap.quickTo(glowRef.current, "y", { duration: 0.6, ease: "power3.out" });

      function onMove(e: MouseEvent) {
        setX(e.clientX);
        setY(e.clientY);
      }
      window.addEventListener("mousemove", onMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMove);
    },
    { dependencies: [mounted, reduce] }
  );

  if (!mounted || reduce) return null;

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div
        ref={glowRef}
        className="absolute w-[55vw] h-[55vw] rounded-full"
        // Centered on the tracked point: quickTo drives x/y as the element's own
        // translate, so the negative margin keeps the glow's center (not its
        // top-left corner) under the cursor.
        style={{ top: "-27.5vw", left: "-27.5vw", filter: "blur(60px)" }}
      />
    </div>
  );
}
