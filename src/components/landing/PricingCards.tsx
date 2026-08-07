"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { CheckCircle2, Sparkles } from "@/components/ui/icons";

/** Free drops in with a grounded bounce; Pro rises with an aspirational elastic
 * overshoot plus a brief glow-scale on its price -- a deliberate contrast between
 * the two tiers rather than identical entrance treatments. */
export function PricingCards() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const freeRef = useRef<HTMLDivElement>(null);
  const proRef = useRef<HTMLDivElement>(null);
  const proPriceRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (reduce || !freeRef.current || !proRef.current) return;
      gsap.set(freeRef.current, { opacity: 0, y: -30 });
      gsap.set(proRef.current, { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
      });
      tl.to(freeRef.current, { y: 0, opacity: 1, duration: 0.7, ease: "bounce.out" })
        .to(proRef.current, { y: 0, opacity: 1, duration: 0.9, ease: "elastic.out(1, 0.6)" }, "<0.1")
        .to(proPriceRef.current, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, ">-0.2");
    },
    { scope: sectionRef, dependencies: [reduce] }
  );

  return (
    <div ref={sectionRef} className="grid sm:grid-cols-2 gap-5">
      <div ref={freeRef} className="glass rounded-2xl p-6 h-full">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Free</p>
        <p className="text-3xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>
          ₹0
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">forever</p>
        <ul className="mt-5 space-y-2 text-sm">
          {["The full Common Core", "Quizzes, XP, streaks & badges", "One free 4-minute mock interview"].map((p) => (
            <li key={p} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[var(--color-success)] mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div ref={proRef} className="glass rounded-2xl p-6 border-[var(--color-primary)]/40 relative overflow-hidden h-full">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[var(--color-accent)]/20 blur-3xl pointer-events-none" />
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] flex items-center gap-1">
          <Sparkles size={13} /> Pro
        </p>
        <p ref={proPriceRef} className="text-3xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>
          Coming soon
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">pricing to be announced</p>
        <ul className="mt-5 space-y-2 text-sm">
          {["All 6 career paths, basics → advanced", "FAANG-caliber quizzes per lesson", "Unlimited Forage Interview sessions"].map((p) => (
            <li key={p} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
