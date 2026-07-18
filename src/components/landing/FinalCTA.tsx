"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { ArrowRight } from "@/components/ui/icons";

/** The page's closing beat: an idle glow pulse once the card is in view, plus a
 * small magnetic pull on the CTA button -- a different accent register (cyan/pink)
 * than the interview spotlight's blue so the two don't read as the same effect reused. */
export function FinalCTA() {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      if (reduce || !cardRef.current) return;

      gsap.to(glowRef.current, {
        opacity: 0.7,
        scale: 1.15,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        scrollTrigger: { trigger: cardRef.current, start: "top 90%" },
      });

      if (!btnRef.current) return;
      const quickX = gsap.quickTo(btnRef.current, "x", { duration: 0.4, ease: "power3" });
      const quickY = gsap.quickTo(btnRef.current, "y", { duration: 0.4, ease: "power3" });
      const MAX = 8;

      function onMove(e: MouseEvent) {
        const rect = btnRef.current!.getBoundingClientRect();
        quickX(gsap.utils.clamp(-MAX, MAX, (e.clientX - (rect.left + rect.width / 2)) / 4));
        quickY(gsap.utils.clamp(-MAX, MAX, (e.clientY - (rect.top + rect.height / 2)) / 4));
      }
      function onLeave() {
        quickX(0);
        quickY(0);
      }

      btnRef.current.addEventListener("mousemove", onMove);
      btnRef.current.addEventListener("mouseleave", onLeave);
      return () => {
        btnRef.current?.removeEventListener("mousemove", onMove);
        btnRef.current?.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: cardRef, dependencies: [reduce] }
  );

  return (
    <div ref={cardRef} className="glass rounded-2xl p-10 relative overflow-hidden">
      <div
        ref={glowRef}
        className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/10 to-[#6ff9ff]/10 pointer-events-none"
      />
      <h2 className="display text-2xl sm:text-3xl mb-3">Stop preparing to prepare.</h2>
      <p className="text-sm text-[#7d99a3] max-w-md mx-auto mb-6">
        Start the Common Core today — it&rsquo;s free, it takes about 10-15 hours, and it
        ends with you choosing a real path.
      </p>
      <Link
        ref={btnRef}
        href="/auth"
        className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#ff3d81] text-[#05070a] text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Start learning free <ArrowRight size={16} />
      </Link>
    </div>
  );
}
