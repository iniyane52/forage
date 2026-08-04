"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/components/ui/gsapMotion";
import { ArrowRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** The page's closing beat: an idle glow pulse once the card is in view, a small
 * magnetic pull on the CTA button, and a quick tactile press-down on click -- a
 * different accent register (cyan/pink) than the interview spotlight's blue so the
 * two don't read as the same effect reused. The button's rect is measured once on
 * mouseenter (not per mousemove), and the glow pulse pauses off-screen instead of
 * running forever once triggered. */
export function FinalCTA() {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useGSAP(
    () => {
      if (reduce || !cardRef.current) return;

      const glowTween = gsap.to(glowRef.current, {
        opacity: 0.7,
        scale: 1.15,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        paused: true,
      });
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? glowTween.play() : glowTween.pause()),
      });

      if (!btnRef.current) return;
      const quickX = gsap.quickTo(btnRef.current, "x", { duration: 0.4, ease: "power3" });
      const quickY = gsap.quickTo(btnRef.current, "y", { duration: 0.4, ease: "power3" });
      const MAX = 8;

      function onEnter() {
        rectRef.current = btnRef.current!.getBoundingClientRect();
      }
      function onMove(e: MouseEvent) {
        const rect = rectRef.current;
        if (!rect) return;
        quickX(gsap.utils.clamp(-MAX, MAX, (e.clientX - (rect.left + rect.width / 2)) / 4));
        quickY(gsap.utils.clamp(-MAX, MAX, (e.clientY - (rect.top + rect.height / 2)) / 4));
      }
      function onLeave() {
        quickX(0);
        quickY(0);
      }
      function onDown() {
        gsap.to(btnRef.current, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" });
      }

      btnRef.current.addEventListener("mouseenter", onEnter);
      btnRef.current.addEventListener("mousemove", onMove);
      btnRef.current.addEventListener("mouseleave", onLeave);
      btnRef.current.addEventListener("mousedown", onDown);
      return () => {
        btnRef.current?.removeEventListener("mouseenter", onEnter);
        btnRef.current?.removeEventListener("mousemove", onMove);
        btnRef.current?.removeEventListener("mouseleave", onLeave);
        btnRef.current?.removeEventListener("mousedown", onDown);
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
      <SectionHeading className="text-2xl sm:text-3xl mb-3">Stop preparing to prepare.</SectionHeading>
      <p className="text-sm text-[#7d99a3] max-w-md mx-auto mb-6">
        Start the Common Core today — it&rsquo;s free, it takes about 10-15 hours, and it
        ends with you choosing a real path.
      </p>
      <Link
        ref={btnRef}
        href="/auth"
        className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors"
      >
        Start learning free <ArrowRight size={16} />
      </Link>
    </div>
  );
}
