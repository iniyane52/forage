"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

export type Step = { n: string; title: string; body: string; accent: string };

/**
 * Each step animates in once as it's scrolled to, then recedes (scales down,
 * fades) as the NEXT step arrives -- reads as the sequence building on itself,
 * not just a plain list appearing.
 *
 * Deliberately NOT pinned (no CSS `position: sticky`, no GSAP ScrollTrigger
 * `pin`). Both were tried and both are broken on this specific page: `<html>`
 * and `<body>` both carry `overflow-x-hidden` (a real, documented fix for a
 * separate marquee-leak bug -- see CLAUDE.md), and that combination makes the
 * browser treat `<html>` as its own scrollport in a way that also corrupts the
 * containing block used by `position: fixed` (which is exactly what GSAP's pin
 * sets under the hood) -- confirmed directly: a pinned card's own inline style
 * read `position: fixed; top: 96px`, yet its actual bounding rect drifted with
 * scrollY as if `top` were a relative document offset, not a viewport one.
 * CSS `sticky` failed the same way, for the same underlying reason. This is
 * the same class of bug that already forced ScrollHero.tsx off scroll-tied
 * pinning entirely in favor of a one-shot reveal -- this component takes the
 * same resolution rather than re-fighting a page-wide CSS constraint that two
 * different mechanisms have now both lost to.
 */
export function HowItWorksTimeline({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion();
  // Gated on `mounted` first: SSR always resolves `reduce` falsy (no `matchMedia`
  // server-side), but a client that genuinely prefers reduced motion resolves it
  // synchronously on its very first render, before hydration completes -- branching
  // the early return on `reduce` alone (a completely different DOM tree: no
  // `elevated` styling, no per-card refs) is a real, confirmed hydration mismatch.
  // Same fix as ScrollHero.tsx/StatCallout.tsx.
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const entranceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const recedeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!mounted || reduce) return;
      const entrances = entranceRefs.current.filter((c): c is HTMLDivElement => !!c);
      const recedes = recedeRefs.current.filter((c): c is HTMLDivElement => !!c);
      if (entrances.length < 2) return;

      // Entrance and recede live on SEPARATE nested elements on purpose: both tween
      // `opacity`, and two tweens sharing one element's property is a real bug that
      // shipped here -- GSAP captures a tween's start values at its first render, so
      // a scrub that first rendered mid-entrance captured a half-faded opacity as its
      // "start" and restored that wrong value when scrolling back up (the reported
      // "content not displayed properly when scrolling back" bug).
      const splits: SplitText[] = [];
      entrances.forEach((el, i) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });

        // Split-flap roll-in, same trigger moment as the card entrance: title
        // letters flip down into place like an airport departure board, and the
        // big step number gets a stronger over-rotation of the same move. Chars
        // only (SplitText words wrapper keeps line-breaks stable), backface
        // hidden so the mid-flip frame doesn't show mirrored text.
        const title = el.querySelector<HTMLElement>("[data-flap-title]");
        const num = el.querySelector<HTMLElement>("[data-flap-num]");
        if (title) {
          const split = new SplitText(title, { type: "words,chars" });
          splits.push(split);
          gsap.set(split.chars, { backfaceVisibility: "hidden" });
          gsap.from(split.chars, {
            rotateX: -90,
            opacity: 0,
            transformOrigin: "center top",
            stagger: 0.035,
            duration: 0.55,
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        }
        if (num) {
          gsap.from(num, {
            rotateX: -270,
            opacity: 0,
            transformPerspective: 500,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        }

        // Recede is driven by the card's OWN exit toward the viewport top (fully
        // reversible in both scroll directions), not the next card's arrival -- the
        // arrival version dimmed a card still centered in the viewport, which read
        // as broken rather than as a stacking recede.
        if (i === entrances.length - 1) return;
        gsap.to(recedes[i], {
          scale: 0.94,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 35%",
            end: "top 8%",
            scrub: true,
          },
        });
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: containerRef, dependencies: [reduce, mounted] }
  );

  if (mounted && reduce) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {steps.map((s) => (
          <StepCard key={s.n} step={s} />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto space-y-8">
      {steps.map((s, i) => (
        <div
          key={s.n}
          ref={(el) => {
            entranceRefs.current[i] = el;
          }}
        >
          <div
            ref={(el) => {
              recedeRefs.current[i] = el;
            }}
          >
            <StepCard step={s} elevated />
          </div>
        </div>
      ))}
    </div>
  );
}

function StepCard({ step, elevated }: { step: Step; elevated?: boolean }) {
  return (
    <div
      className={`rounded-3xl p-8 sm:p-10 ${elevated ? "glass-solid" : ""}`}
      style={elevated ? { boxShadow: `0 30px 80px -30px ${step.accent}33` } : undefined}
    >
      <span
        data-flap-num
        className="inline-flex w-14 h-14 rounded-2xl items-center justify-center font-mono font-bold text-xl mb-5"
        style={{ backgroundColor: "#0c1116", color: step.accent, border: `2px solid ${step.accent}` }}
      >
        {step.n}
      </span>
      <h3
        data-flap-title
        className="text-2xl sm:text-3xl font-bold leading-tight"
        style={{ fontFamily: "var(--font-display)", perspective: 400 }}
      >
        {step.title}
      </h3>
      <p className="text-sm sm:text-base text-[#7d99a3] mt-2 max-w-lg leading-relaxed">{step.body}</p>
    </div>
  );
}
