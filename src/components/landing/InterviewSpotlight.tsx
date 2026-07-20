"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/components/ui/gsapMotion";
import { ArrowRight, Mic } from "@/components/ui/icons";

/** The mic icon gets a subtle magnetic pull toward the cursor plus an idle glow
 * pulse -- a small, tactile moment on the page's one voice-interaction feature.
 * The card's bounding rect is measured once on mouseenter (not on every mousemove,
 * which would force a synchronous layout read per event), and the glow pulse pauses
 * when scrolled off-screen instead of running forever from mount. */
export function InterviewSpotlight() {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useGSAP(
    () => {
      if (reduce || !cardRef.current || !micRef.current) return;

      const glowTween = gsap.to(glowRef.current, {
        opacity: 0.55,
        scale: 1.12,
        duration: 2.2,
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

      const quickX = gsap.quickTo(micRef.current, "x", { duration: 0.5, ease: "power3" });
      const quickY = gsap.quickTo(micRef.current, "y", { duration: 0.5, ease: "power3" });
      const MAX = 10;

      function onEnter() {
        rectRef.current = cardRef.current!.getBoundingClientRect();
      }
      function onMove(e: MouseEvent) {
        const rect = rectRef.current;
        if (!rect) return;
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        quickX(gsap.utils.clamp(-MAX, MAX, relX / 8));
        quickY(gsap.utils.clamp(-MAX, MAX, relY / 8));
      }
      function onLeave() {
        quickX(0);
        quickY(0);
      }

      cardRef.current.addEventListener("mouseenter", onEnter);
      cardRef.current.addEventListener("mousemove", onMove);
      cardRef.current.addEventListener("mouseleave", onLeave);

      function onDown() {
        gsap.to(ctaRef.current, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" });
      }
      ctaRef.current?.addEventListener("mousedown", onDown);

      return () => {
        cardRef.current?.removeEventListener("mouseenter", onEnter);
        cardRef.current?.removeEventListener("mousemove", onMove);
        cardRef.current?.removeEventListener("mouseleave", onLeave);
        ctaRef.current?.removeEventListener("mousedown", onDown);
      };
    },
    { scope: cardRef, dependencies: [reduce] }
  );

  return (
    <div
      ref={cardRef}
      className="glass rounded-2xl p-8 sm:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden"
    >
      <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-[#3d8fff]/15 blur-3xl pointer-events-none" />
      <div>
        <h2 className="display text-2xl sm:text-3xl mb-3">Rehearse the real thing, out loud</h2>
        <p className="text-sm text-[#7d99a3] max-w-xl leading-relaxed">
          <strong className="text-[#ece9f5] font-semibold">Forage Interview</strong> is a
          live, voice-first mock interview for your target role. Pick behavioral,
          technical, or DSA — the AI interviewer asks one question at a time, follows up
          naturally, and closes with a feedback report: what worked, what to fix, and a
          stronger model answer. Free users get one 4-minute trial; Pro is unlimited.
        </p>
        <Link
          ref={ctaRef}
          href="/auth"
          className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#3d8fff] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try the free trial <ArrowRight size={15} />
        </Link>
      </div>
      <div className="relative w-28 h-28 mx-auto shrink-0">
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-full bg-[#3d8fff]/30 blur-xl pointer-events-none"
          style={{ opacity: 0.25 }}
        />
        <div ref={micRef} className="relative w-28 h-28 rounded-full glass grid place-items-center">
          <Mic size={36} className="text-[#5ba3ff]" />
        </div>
      </div>
    </div>
  );
}
