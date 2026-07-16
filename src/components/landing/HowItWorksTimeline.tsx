"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export type Step = { n: string; title: string; body: string; accent: string };

/**
 * A connected, scroll-drawn timeline instead of a click-through carousel -- justified
 * because these 4 steps genuinely are a sequence (start -> choose -> study -> ready),
 * so a process line encodes real meaning rather than decorating. Bigger type than the
 * old carousel cards by design (the ask was "increase the scale").
 */
export function HowItWorksTimeline({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative max-w-2xl mx-auto">
      <div className="absolute left-[27px] sm:left-[35px] top-3 bottom-3 w-[2px] bg-white/[0.08]" aria-hidden="true">
        {!reduce && (
          <motion.div
            className="w-full h-full origin-top bg-gradient-to-b from-[#00e5ff] to-[#baff2e]"
            style={{ scaleY: lineScale }}
          />
        )}
      </div>
      <Stagger className="space-y-10 sm:space-y-14">
        {steps.map((s) => (
          <StaggerItem key={s.n} className="relative pl-[70px] sm:pl-[92px]">
            {/* Solid fill (not the translucent tint used elsewhere) so the line behind it
                is fully hidden, not visible poking through the badge. */}
            <motion.span
              className="absolute left-0 top-0 z-10 w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-2xl grid place-items-center font-mono font-bold text-xl sm:text-2xl"
              style={{ backgroundColor: "#0c1116", color: s.accent, border: `2px solid ${s.accent}` }}
              whileInView={
                reduce
                  ? undefined
                  : { boxShadow: [`0 0 0 0px ${s.accent}66`, `0 0 0 16px ${s.accent}00`] }
              }
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {s.n}
            </motion.span>
            <h3 className="text-xl sm:text-3xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {s.title}
            </h3>
            <p className="text-sm sm:text-base text-[#7d99a3] mt-2 max-w-lg leading-relaxed">{s.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
