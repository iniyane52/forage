"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/components/ui/gsapMotion";
import { useMounted } from "@/hooks/useMounted";
import { Confetti } from "@/components/ui/Confetti";

export type CliStep = { command: string; output: string; tag: string; accent: string };

const CHAR_MS = 26;
const LINE_HOLD_MS = 350;
const STEP_HOLD_MS = 550;
const TAG_TO_NEXT_MS = 500;

/**
 * "How Forage works" as one simulated terminal session, not a numbered card
 * list: each step types out as a real CLI command + its output (same
 * character-by-character mechanic as TypingCode.tsx's dashboard-mockup
 * snippet), a small reward tag pops in once the output settles, and the last
 * step closes with a confetti burst (Confetti.tsx, already used for quiz-pass
 * moments elsewhere). Plays once when scrolled into view -- a standalone
 * ScrollTrigger.create (not a tween), since the sequence itself is a chain of
 * setTimeout/setInterval calls, not a GSAP animation. Reduced motion renders
 * the fully-typed end state immediately, no animation, no confetti.
 *
 * The animated terminal is `aria-hidden` -- a screen-reader user shouldn't have
 * to wait through ~8s of simulated typing to get real content, so a plain
 * `sr-only` block carries the same information up front (same pattern as
 * ScrambleTagline.tsx's decorative-vs-sr-only split).
 */
export function TerminalWalkthrough({ steps }: { steps: CliStep[] }) {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const commandRefs = useRef<(HTMLElement | null)[]>([]);
  const outputRefs = useRef<(HTMLElement | null)[]>([]);
  const [started, setStarted] = useState(false);
  const [revealedTag, setRevealedTag] = useState(-1);
  const [confetti, setConfetti] = useState(false);

  useGSAP(
    () => {
      if (!mounted || reduce || !containerRef.current || started) return;
      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => setStarted(true),
      });
      return () => trigger.kill();
    },
    { scope: containerRef, dependencies: [mounted, reduce, started] }
  );

  useEffect(() => {
    if (!started || reduce) return;
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) fn();
        }, delay)
      );
    };
    function typeInto(el: HTMLElement | null, text: string, delay: number) {
      schedule(() => {
        let pos = 0;
        const interval = setInterval(() => {
          if (cancelled || !el) {
            clearInterval(interval);
            return;
          }
          pos++;
          el.textContent = text.slice(0, pos);
          if (pos >= text.length) clearInterval(interval);
        }, CHAR_MS);
      }, delay);
    }

    let t = 300;
    steps.forEach((step, i) => {
      typeInto(commandRefs.current[i], step.command, t);
      t += step.command.length * CHAR_MS + LINE_HOLD_MS;
      typeInto(outputRefs.current[i], step.output, t);
      t += step.output.length * CHAR_MS + STEP_HOLD_MS;
      schedule(() => setRevealedTag(i), t);
      t += TAG_TO_NEXT_MS;
    });
    schedule(() => setConfetti(true), t);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [started, reduce, steps]);

  const finalState = mounted && reduce;

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto relative">
      <p className="sr-only">
        {steps.map((s) => `${s.command}: ${s.output} (${s.tag})`).join(". ")}
      </p>
      <div aria-hidden="true" className="rounded-2xl glass-solid overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff4757]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffb020]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/60" />
          <span className="ml-2 text-xs font-mono text-[#7d99a3]">forage — how it works</span>
        </div>
        <div className="px-5 py-6 sm:px-7 sm:py-8 font-mono text-sm leading-relaxed space-y-5">
          {steps.map((step, i) => (
            <div key={step.command}>
              <p>
                <span className="text-[#baff2e]">$ </span>
                <span
                  ref={(el) => {
                    commandRefs.current[i] = el;
                  }}
                >
                  {finalState ? step.command : ""}
                </span>
              </p>
              <p className="mt-1 text-[#9fe8f0]">
                <span className="text-[#7d99a3]">{"→ "}</span>
                <span
                  ref={(el) => {
                    outputRefs.current[i] = el;
                  }}
                >
                  {finalState ? step.output : ""}
                </span>
              </p>
              {(finalState || revealedTag >= i) && (
                <span
                  className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{
                    color: step.accent,
                    backgroundColor: `${step.accent}1a`,
                    border: `1px solid ${step.accent}44`,
                  }}
                >
                  {step.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      {confetti && <Confetti count={36} />}
    </div>
  );
}
