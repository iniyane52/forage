"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";

/** A large stat used to fill flanking space beside a centered carousel with
 * something real instead of empty margin -- actual platform numbers, not filler.
 * The count is tied to scroll position (ScrollTrigger-scrubbed) rather than a
 * fixed on-mount timer, so it reads as something the user's own scrolling reveals. */
export function StatCallout({
  value,
  suffix = "",
  label,
  accent = "#00e5ff",
  className = "",
}: {
  value: number;
  suffix?: string;
  label: string;
  accent?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduce || !numberRef.current) return;
      const counter = { v: 0 };
      numberRef.current.textContent = `0${suffix}`;
      gsap.to(counter, {
        v: value,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 85%",
          end: "top 40%",
          scrub: 0.4,
        },
        onUpdate: () => {
          if (numberRef.current) numberRef.current.textContent = `${Math.round(counter.v)}${suffix}`;
        },
      });
    },
    { scope: rootRef, dependencies: [reduce, value, suffix] }
  );

  return (
    <div ref={rootRef} className={`font-mono ${className}`}>
      <div
        ref={numberRef}
        className="text-4xl xl:text-5xl font-bold tabular-nums"
        style={{ color: accent, fontFamily: "var(--font-display)" }}
      >
        {reduce ? `${value}${suffix}` : `0${suffix}`}
      </div>
      <p className="text-[11px] text-[#7d99a3] uppercase tracking-widest mt-1.5 max-w-[10rem]">{label}</p>
    </div>
  );
}
