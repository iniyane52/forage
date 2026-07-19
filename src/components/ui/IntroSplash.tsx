"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";

const WORD = "FORAGE";
const SCRAMBLE_GLYPHS = "アカサタナ0123456789#{}<>/=+*";

/**
 * Branded entry: a full-viewport overlay where "FORAGE" resolves out of matrix
 * glyph noise (each letter cycles random glyphs then settles left-to-right),
 * followed by a push-in exit -- the overlay fades/scales up while the page behind
 * scales from slightly-small to full, reading as being pushed into the site.
 *
 * Runs on every load by the user's explicit choice, but any click / key / wheel /
 * touch skips it instantly (fast-forwards to the exit). Reduced motion renders
 * nothing at all. While visible it locks body scroll and flags
 * `<html data-splash="1">` so HeroHeadline holds its own entrance until the
 * `forage-splash-done` event -- otherwise the hero tumble would play out hidden
 * behind the overlay and be over by reveal.
 */
export function IntroSplash({ oncePerSessionKey }: { oncePerSessionKey?: string } = {}) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const dotRef = useRef<HTMLSpanElement>(null);

  // With a session key, the splash only plays if this browser session hasn't seen
  // it yet (used inside the app: full splash once per sign-in session, never
  // between pages). Read lazily but only consulted once `mounted` is true, so SSR
  // and the hydration render never touch sessionStorage.
  const [seenThisSession] = useState(() => {
    if (typeof window === "undefined" || !oncePerSessionKey) return false;
    try {
      return sessionStorage.getItem(oncePerSessionKey) === "1";
    } catch {
      return false;
    }
  });

  const active = mounted && !reduce && !done && !seenThisSession;

  // Layout effect (not useEffect): the flag must be up before HeroHeadline's own
  // useGSAP layout effect reads it, and body scroll must lock before first paint.
  useLayoutEffect(() => {
    if (!active) return;
    document.documentElement.dataset.splash = "1";
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      delete document.documentElement.dataset.splash;
      document.body.style.overflow = prevOverflow;
      window.dispatchEvent(new Event("forage-splash-done"));
      if (oncePerSessionKey) {
        try {
          sessionStorage.setItem(oncePerSessionKey, "1");
        } catch {
          // Storage unavailable (private mode etc.) -- splash just replays next load.
        }
      }
    };
  }, [active, oncePerSessionKey]);

  useGSAP(
    () => {
      if (!active || !overlayRef.current) return;
      const letters = lettersRef.current.filter((l): l is HTMLSpanElement => !!l);
      const scrambleTimeouts: ReturnType<typeof setTimeout>[] = [];

      // Per-letter glyph noise, resolving left-to-right: letter i cycles random
      // glyphs until its settle moment, then locks to its real character.
      letters.forEach((letter, i) => {
        const settleAt = 500 + i * 180;
        for (let t = 0; t < settleAt; t += 60) {
          scrambleTimeouts.push(
            setTimeout(() => {
              letter.textContent = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
            }, t)
          );
        }
        scrambleTimeouts.push(
          setTimeout(() => {
            letter.textContent = WORD[i];
          }, settleAt)
        );
      });

      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });
      tl.from(letters, { opacity: 0, y: 18, stagger: 0.06, duration: 0.4, ease: "power2.out" })
        .from(dotRef.current, { scale: 0, duration: 0.35, ease: "back.out(2.5)" }, 1.7)
        .to(dotRef.current, { scale: 1.5, opacity: 0.5, duration: 0.25, yoyo: true, repeat: 1 }, ">")
        // Push-in: overlay grows past the viewport as it fades, so the page behind
        // reads as coming toward you.
        .to(overlayRef.current, { opacity: 0, scale: 1.08, duration: 0.55, ease: "power2.inOut" }, 2.3);

      function skip() {
        scrambleTimeouts.forEach(clearTimeout);
        letters.forEach((l, i) => (l.textContent = WORD[i]));
        // Jump to just before the exit so the push-in still plays, fast.
        if (tl.progress() < 0.8) tl.seek(2.3).timeScale(1.6);
      }
      window.addEventListener("pointerdown", skip);
      window.addEventListener("keydown", skip);
      window.addEventListener("wheel", skip, { passive: true });
      window.addEventListener("touchstart", skip, { passive: true });

      return () => {
        scrambleTimeouts.forEach(clearTimeout);
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("wheel", skip);
        window.removeEventListener("touchstart", skip);
      };
    },
    { scope: overlayRef, dependencies: [active] }
  );

  if (!active) return null;

  // Portaled to <body>, NOT rendered in place: the site-wide page-transition
  // wrapper (src/app/template.tsx's .page-enter) animates the standalone
  // `translate` property, and any non-none translate on an ancestor makes it the
  // containing block for position:fixed descendants -- rendered inline, this
  // overlay's inset-0 filled the whole page div and the centered wordmark sat
  // thousands of px below the viewport (confirmed live). On body, no transformed
  // ancestor exists, so fixed means the actual viewport.
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-[#05070a] flex items-center justify-center"
      role="presentation"
    >
      <p
        className="font-bold tracking-[0.18em] text-4xl sm:text-6xl select-none"
        style={{ fontFamily: "var(--font-hero)" }}
        aria-label="Forage"
      >
        {WORD.split("").map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              lettersRef.current[i] = el;
            }}
            className="inline-block"
            aria-hidden="true"
          >
            {ch}
          </span>
        ))}
        <span ref={dotRef} className="inline-block text-[#00e5ff]" aria-hidden="true">
          .
        </span>
      </p>
    </div>,
    document.body
  );
}
