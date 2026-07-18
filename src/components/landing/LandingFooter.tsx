"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";

/** A restrained one-shot reveal plus a single delayed color-flash on the wordmark's
 * dot -- the page's closing beat, not a new focal point. */
export function LandingFooter() {
  const reduce = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (reduce || !footerRef.current) return;
      gsap.set(footerRef.current, { opacity: 0, y: 12 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: footerRef.current, start: "top 95%", once: true },
      });
      tl.to(footerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (dotRef.current) {
        tl.to(dotRef.current, { color: "#baff2e", duration: 0.3, yoyo: true, repeat: 1 }, "+=0.2");
      }
    },
    { scope: footerRef, dependencies: [reduce] }
  );

  return (
    <footer ref={footerRef} className="border-t border-white/[0.06] py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7d99a3]">
        <span style={{ fontFamily: "var(--font-display)" }}>
          Forage
          <span ref={dotRef} className="text-[#00e5ff]">
            .
          </span>
        </span>
        <span>Built for people done preparing-as-procrastination.</span>
      </div>
    </footer>
  );
}
